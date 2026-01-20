import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    entityType: string,
    entityId: string,
    action: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION',
    oldValue: string | null,
    newValue: string | null,
    userId: string,
  ) {
    return this.prisma.journalAudit.create({
      data: {
        typeEntite: entityType,
        idEntite: entityId,
        action,
        ancienneValeur: oldValue,
        nouvelleValeur: newValue,
        utilisateurId: userId,
      },
    });
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.journalAudit.findMany({
      where: {
        typeEntite: entityType,
        idEntite: entityId,
      },
      include: {
        utilisateur: {
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

  async findAll(limit = 100) {
    return this.prisma.journalAudit.findMany({
      take: limit,
      include: {
        utilisateur: {
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
}
