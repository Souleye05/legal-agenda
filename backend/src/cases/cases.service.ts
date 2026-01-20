import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';

@Injectable()
export class CasesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(status?: string) {
    return this.prisma.affaire.findMany({
      where: status ? { statut: status as any } : undefined,
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
    // Generate reference
    const year = new Date().getFullYear();
    const lastCase = await this.prisma.affaire.findFirst({
      where: {
        reference: {
          startsWith: `AFF-${year}-`,
        },
      },
      orderBy: { reference: 'desc' },
    });

    let nextNumber = 1;
    if (lastCase) {
      const lastNumber = parseInt(lastCase.reference.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const reference = `AFF-${year}-${nextNumber.toString().padStart(4, '0')}`;

    const caseData = await this.prisma.affaire.create({
      data: {
        reference,
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

  async update(id: string, dto: UpdateCaseDto) {
    const oldCase = await this.findOne(id);

    const updated = await this.prisma.affaire.update({
      where: { id },
      data: {
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

    await this.auditService.log('Affaire', id, 'MODIFICATION', JSON.stringify(oldCase), JSON.stringify(updated), oldCase.createurId);

    return updated;
  }

  async remove(id: string) {
    const caseData = await this.findOne(id);
    await this.prisma.affaire.delete({ where: { id } });
    await this.auditService.log('Affaire', id, 'SUPPRESSION', JSON.stringify(caseData), null, caseData.createurId);
    return { message: 'Case deleted successfully' };
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
