import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { PaginationDto, createPaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class CasesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(status?: string, pagination?: PaginationDto) {
    const where = status ? { statut: status as any } : undefined;

    // Si pagination est fournie, utiliser la pagination
    if (pagination) {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.affaire.findMany({
          where,
          include: {
            parties: true,
            audiences: {
              orderBy: { date: 'desc' },
              take: 1,
            },
            createur: {
              select: {
                id: true,
                nomComplet: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.affaire.count({ where }),
      ]);

      return createPaginatedResult(data, total, page, limit);
    }

    // Sinon, retourner toutes les données (rétrocompatibilité)
    const allCases = await this.prisma.affaire.findMany({
      where,
      include: {
        parties: true,
        audiences: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        createur: {
          select: {
            id: true,
            nomComplet: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log pour debug
    console.log(`[CasesService] findAll - Total cases: ${allCases.length}, Active: ${allCases.filter(c => c.statut === 'ACTIVE').length}`);
    
    return allCases;
  }

  async findOne(id: string) {
    const caseData = await this.prisma.affaire.findUnique({
      where: { id },
      include: {
        parties: true,
        audiences: {
          include: {
            resultat: true,
          },
          orderBy: { date: 'desc' },
        },
        createur: {
          select: {
            id: true,
            nomComplet: true,
            email: true,
          },
        },
      },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    return caseData;
  }

  async create(dto: CreateCaseDto, userId: string) {
    // Use the provided reference instead of generating one
    const caseData = await this.prisma.affaire.create({
      data: {
        reference: dto.reference,
        titre: dto.titre,
        juridiction: dto.juridiction,
        chambre: dto.chambre,
        ville: dto.ville,
        observations: dto.observations,
        createurId: userId,
        parties: {
          create: dto.parties.map(p => ({ 
            nom: p.nom, 
            role: p.role
          })),
        },
      },
      include: {
        parties: true,
      },
    });

    await this.auditService.log('Affaire', caseData.id, 'CREATION', null, JSON.stringify(caseData), userId);

    return caseData;
  }

  async update(id: string, dto: UpdateCaseDto, userId: string) {
    const oldCase = await this.findOne(id);

    // Handle parties update if provided
    if (dto.parties) {
      // Delete existing parties
      await this.prisma.partie.deleteMany({
        where: { affaireId: id },
      });

      // Create new parties
      await this.prisma.partie.createMany({
        data: dto.parties.map(p => ({
          affaireId: id,
          nom: p.nom,
          role: p.role,
        })),
      });
    }

    const updated = await this.prisma.affaire.update({
      where: { id },
      data: {
        reference: dto.reference,
        titre: dto.titre,
        juridiction: dto.juridiction,
        chambre: dto.chambre,
        ville: dto.ville,
        statut: dto.statut,
        observations: dto.observations,
      },
      include: {
        parties: true,
      },
    });

    await this.auditService.log('Affaire', id, 'MODIFICATION', JSON.stringify(oldCase), JSON.stringify(updated), userId);

    return updated;
  }

  async remove(id: string, userId: string) {
    const caseData = await this.findOne(id);
    await this.prisma.affaire.delete({ where: { id } });
    await this.auditService.log('Affaire', id, 'SUPPRESSION', JSON.stringify(caseData), null, userId);
    return { message: 'Affaire supprimée avec succès' };
  }

  async getStats() {
    const [activeCases, closedCases, radiatedCases] = await Promise.all([
      this.prisma.affaire.count({ where: { statut: 'ACTIVE' } }),
      this.prisma.affaire.count({ where: { statut: 'CLOTUREE' } }),
      this.prisma.affaire.count({ where: { statut: 'RADIEE' } }),
    ]);

    return {
      activeCases,
      closedCases,
      radiatedCases,
      totalCases: activeCases + closedCases + radiatedCases,
    };
  }
}
