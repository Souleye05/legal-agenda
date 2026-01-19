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
    return this.prisma.hearing.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(caseId && { caseId }),
      },
      include: {
        case: {
          include: {
            parties: true,
          },
        },
        result: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string) {
    const hearing = await this.prisma.hearing.findUnique({
      where: { id },
      include: {
        case: {
          include: {
            parties: true,
          },
        },
        result: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
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
    const hearing = await this.prisma.hearing.create({
      data: {
        date: new Date(dto.date),
        time: dto.time,
        type: dto.type,
        preparationNotes: dto.preparationNotes,
        caseId: dto.caseId,
        createdById: userId,
      },
      include: {
        case: {
          include: {
            parties: true,
          },
        },
      },
    });

    await this.auditService.log('Hearing', hearing.id, 'CREATE', null, JSON.stringify(hearing), userId);

    return hearing;
  }

  async update(id: string, dto: UpdateHearingDto) {
    const oldHearing = await this.findOne(id);

    const updated = await this.prisma.hearing.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.time !== undefined && { time: dto.time }),
        ...(dto.type && { type: dto.type }),
        ...(dto.preparationNotes !== undefined && { preparationNotes: dto.preparationNotes }),
        ...(dto.isPrepared !== undefined && { isPrepared: dto.isPrepared }),
      },
      include: {
        case: {
          include: {
            parties: true,
          },
        },
        result: true,
      },
    });

    await this.auditService.log('Hearing', id, 'UPDATE', JSON.stringify(oldHearing), JSON.stringify(updated), oldHearing.createdById);

    return updated;
  }

  async recordResult(id: string, dto: RecordResultDto, userId: string) {
    const hearing = await this.findOne(id);

    if (hearing.result) {
      throw new BadRequestException('Result already recorded for this hearing');
    }

    // Create result
    const result = await this.prisma.hearingResult.create({
      data: {
        type: dto.type,
        newDate: dto.newDate ? new Date(dto.newDate) : null,
        postponementReason: dto.postponementReason,
        radiationReason: dto.radiationReason,
        deliberationText: dto.deliberationText,
        hearingId: id,
        createdById: userId,
      },
    });

    // Update hearing status
    await this.prisma.hearing.update({
      where: { id },
      data: { status: 'TENUE' },
    });

    // Handle automatic actions based on result type
    if (dto.type === 'RENVOI' && dto.newDate) {
      // Create new hearing for postponed date
      await this.create({
        caseId: hearing.caseId,
        date: dto.newDate,
        time: hearing.time,
        type: hearing.type,
        preparationNotes: `Renvoi de l'audience du ${hearing.date.toLocaleDateString()}. ${dto.postponementReason || ''}`,
      }, userId);
    } else if (dto.type === 'RADIATION') {
      // Close case as RADIEE
      await this.prisma.case.update({
        where: { id: hearing.caseId },
        data: { status: 'RADIEE' },
      });
    } else if (dto.type === 'DELIBERE') {
      // Close case as CLOTUREE
      await this.prisma.case.update({
        where: { id: hearing.caseId },
        data: { status: 'CLOTUREE' },
      });
    }

    // Resolve any pending alerts for this hearing
    await this.alertsService.resolveAlertsForHearing(id);

    await this.auditService.log('HearingResult', result.id, 'CREATE', null, JSON.stringify(result), userId);

    return result;
  }

  async remove(id: string) {
    const hearing = await this.findOne(id);
    await this.prisma.hearing.delete({ where: { id } });
    await this.auditService.log('Hearing', id, 'DELETE', JSON.stringify(hearing), null, hearing.createdById);
    return { message: 'Hearing deleted successfully' };
  }

  async getUnreported() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.hearing.findMany({
      where: {
        date: { lt: today },
        status: { in: ['A_VENIR', 'NON_RENSEIGNEE'] },
        result: null,
      },
      include: {
        case: {
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

    return this.prisma.hearing.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfter,
        },
        status: 'A_VENIR',
      },
      include: {
        case: {
          include: {
            parties: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async getCalendar(month?: string, year?: string) {
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    return this.prisma.hearing.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        case: {
          include: {
            parties: true,
          },
        },
        result: true,
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async markUnreportedHearings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unreported = await this.prisma.hearing.findMany({
      where: {
        date: { lt: today },
        status: 'A_VENIR',
        result: null,
      },
    });

    for (const hearing of unreported) {
      await this.prisma.hearing.update({
        where: { id: hearing.id },
        data: { status: 'NON_RENSEIGNEE' },
      });

      // Create alert
      await this.alertsService.createAlert(hearing.id);
    }

    return unreported.length;
  }
}
