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
    return this.prisma.case.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        parties: true,
        hearings: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
      include: {
        parties: true,
        hearings: {
          include: {
            result: true,
          },
          orderBy: { date: 'desc' },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
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
    const lastCase = await this.prisma.case.findFirst({
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

    const caseData = await this.prisma.case.create({
      data: {
        reference,
        title: dto.title,
        jurisdiction: dto.jurisdiction,
        chamber: dto.chamber,
        city: dto.city,
        observations: dto.observations,
        createdById: userId,
        parties: {
          create: dto.parties,
        },
      },
      include: {
        parties: true,
      },
    });

    await this.auditService.log('Case', caseData.id, 'CREATE', null, JSON.stringify(caseData), userId);

    return caseData;
  }

  async update(id: string, dto: UpdateCaseDto) {
    const oldCase = await this.findOne(id);

    const updated = await this.prisma.case.update({
      where: { id },
      data: {
        title: dto.title,
        jurisdiction: dto.jurisdiction,
        chamber: dto.chamber,
        city: dto.city,
        status: dto.status,
        observations: dto.observations,
      },
      include: {
        parties: true,
      },
    });

    await this.auditService.log('Case', id, 'UPDATE', JSON.stringify(oldCase), JSON.stringify(updated), oldCase.createdById);

    return updated;
  }

  async remove(id: string) {
    const caseData = await this.findOne(id);
    await this.prisma.case.delete({ where: { id } });
    await this.auditService.log('Case', id, 'DELETE', JSON.stringify(caseData), null, caseData.createdById);
    return { message: 'Case deleted successfully' };
  }

  async getStats() {
    const [activeCases, closedCases, radiatedCases] = await Promise.all([
      this.prisma.case.count({ where: { status: 'ACTIVE' } }),
      this.prisma.case.count({ where: { status: 'CLOTUREE' } }),
      this.prisma.case.count({ where: { status: 'RADIEE' } }),
    ]);

    return {
      activeCases,
      closedCases,
      radiatedCases,
      totalCases: activeCases + closedCases + radiatedCases,
    };
  }
}
