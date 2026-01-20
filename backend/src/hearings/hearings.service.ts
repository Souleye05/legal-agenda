import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AlertsService } from '../alerts/alerts.service';
import { CreateHearingDto, UpdateHearingDto, RecordResultDto } from './dto/hearing.dto';

@Injectable()
export class HearingsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private alertsService: AlertsService,
  ) {}

  async findAll(status?: string, caseId?: string) {
    return this.prisma.audience.findMany({
      where: {
        ...(status && { statut: status as any }),
        ...(caseId && { affaireId: caseId }),
      },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
        resultat: true,
        createur: {
          select: {
            id: true,
            nomComplet: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string) {
    const hearing = await this.prisma.audience.findUnique({
      where: { id },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
        resultat: true,
        createur: {
          select: {
            id: true,
            nomComplet: true,
          },
        },
      },
    });

    if (!hearing) {
      throw new NotFoundException('Hearing not found');
    }

    return hearing;
  }

  async create(dto: CreateHearingDto, userId: string) {
    const hearing = await this.prisma.audience.create({
      data: {
        date: new Date(dto.date),
        heure: dto.time,
        type: dto.type,
        notesPreparation: dto.preparationNotes,
        affaireId: dto.caseId,
        createurId: userId,
      },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
      },
    });

    await this.auditService.log('Audience', hearing.id, 'CREATION', null, JSON.stringify(hearing), userId);

    return hearing;
  }

  async update(id: string, dto: UpdateHearingDto) {
    const oldHearing = await this.findOne(id);

    const updated = await this.prisma.audience.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.time !== undefined && { heure: dto.time }),
        ...(dto.type && { type: dto.type }),
        ...(dto.preparationNotes !== undefined && { notesPreparation: dto.preparationNotes }),
        ...(dto.isPrepared !== undefined && { estPreparee: dto.isPrepared }),
      },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
        resultat: true,
      },
    });

    await this.auditService.log('Audience', id, 'MODIFICATION', JSON.stringify(oldHearing), JSON.stringify(updated), oldHearing.createurId);

    return updated;
  }

  async recordResult(id: string, dto: RecordResultDto, userId: string) {
    const hearing = await this.findOne(id);

    if (hearing.resultat) {
      throw new BadRequestException('Result already recorded for this hearing');
    }

    // Create result
    const result = await this.prisma.resultatAudience.create({
      data: {
        type: dto.type,
        nouvelleDate: dto.newDate ? new Date(dto.newDate) : null,
        motifRenvoi: dto.postponementReason,
        motifRadiation: dto.radiationReason,
        texteDelibere: dto.deliberationText,
        audienceId: id,
        createurId: userId,
      },
    });

    // Update hearing status
    await this.prisma.audience.update({
      where: { id },
      data: { statut: 'TENUE' },
    });

    // Handle automatic actions based on result type
    if (dto.type === 'RENVOI' && dto.newDate) {
      // Create new hearing for postponed date
      await this.create({
        caseId: hearing.affaireId,
        date: dto.newDate,
        time: hearing.heure,
        type: hearing.type,
        preparationNotes: `Renvoi de l'audience du ${hearing.date.toLocaleDateString()}. ${dto.postponementReason || ''}`,
      }, userId);
    } else if (dto.type === 'RADIATION') {
      // Close case as RADIEE
      await this.prisma.affaire.update({
        where: { id: hearing.affaireId },
        data: { statut: 'RADIEE' },
      });
    } else if (dto.type === 'DELIBERE') {
      // Close case as CLOTUREE
      await this.prisma.affaire.update({
        where: { id: hearing.affaireId },
        data: { statut: 'CLOTUREE' },
      });
    }

    // Resolve any pending alerts for this hearing
    await this.alertsService.resolveAlertsForHearing(id);

    await this.auditService.log('ResultatAudience', result.id, 'CREATION', null, JSON.stringify(result), userId);

    return result;
  }

  async remove(id: string) {
    const hearing = await this.findOne(id);
    await this.prisma.audience.delete({ where: { id } });
    await this.auditService.log('Audience', id, 'SUPPRESSION', JSON.stringify(hearing), null, hearing.createurId);
    return { message: 'Hearing deleted successfully' };
  }

  async getUnreported() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.audience.findMany({
      where: {
        date: { lt: today },
        statut: { in: ['A_VENIR', 'NON_RENSEIGNEE'] },
        resultat: null,
      },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    return this.prisma.audience.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfter,
        },
        statut: 'A_VENIR',
      },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { heure: 'asc' }],
    });
  }

  async getCalendar(month?: string, year?: string) {
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    return this.prisma.audience.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
        resultat: true,
      },
      orderBy: [{ date: 'asc' }, { heure: 'asc' }],
    });
  }

  async markUnreportedHearings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unreported = await this.prisma.audience.findMany({
      where: {
        date: { lt: today },
        statut: 'A_VENIR',
        resultat: null,
      },
    });

    for (const hearing of unreported) {
      await this.prisma.audience.update({
        where: { id: hearing.id },
        data: { statut: 'NON_RENSEIGNEE' },
      });

      // Create alert
      await this.alertsService.createAlert(hearing.id);
    }

    return unreported.length;
  }
}
