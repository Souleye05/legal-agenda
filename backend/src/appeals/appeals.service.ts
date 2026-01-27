import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateAppealReminderDto, UpdateAppealReminderDto } from './dto/appeal.dto';
import { PaginationDto, createPaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class AppealsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Récupère tous les rappels de recours actifs (non effectués)
   */
  async findAll(pagination?: PaginationDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      estEffectue: false,
    };

    // Si pagination est fournie, utiliser la pagination
    if (pagination) {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.rappelRecours.findMany({
          where,
          include: {
            affaire: {
              include: {
                parties: true,
              },
            },
            resultatAudience: {
              include: {
                audience: true,
              },
            },
            createur: {
              select: {
                id: true,
                nomComplet: true,
              },
            },
          },
          orderBy: [
            { dateLimite: 'asc' },
          ],
          skip,
          take: limit,
        }),
        this.prisma.rappelRecours.count({ where }),
      ]);

      return createPaginatedResult(data, total, page, limit);
    }

    // Sinon, retourner toutes les données (rétrocompatibilité)
    return this.prisma.rappelRecours.findMany({
      where,
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
        resultatAudience: {
          include: {
            audience: true,
          },
        },
        createur: {
          select: {
            id: true,
            nomComplet: true,
          },
        },
      },
      orderBy: [
        { dateLimite: 'asc' },
      ],
    });
  }

  /**
   * Récupère les rappels effectués
   */
  async findCompleted() {
    return this.prisma.rappelRecours.findMany({
      where: {
        estEffectue: true,
      },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
        resultatAudience: {
          include: {
            audience: true,
          },
        },
        createur: {
          select: {
            id: true,
            nomComplet: true,
          },
        },
      },
      orderBy: [
        { dateEffectue: 'desc' },
      ],
      take: 50, // Limiter aux 50 derniers
    });
  }

  /**
   * Récupère un rappel par ID
   */
  async findOne(id: string) {
    const reminder = await this.prisma.rappelRecours.findUnique({
      where: { id },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
        resultatAudience: {
          include: {
            audience: true,
          },
        },
        createur: {
          select: {
            id: true,
            nomComplet: true,
          },
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException('Rappel de recours non trouvé');
    }

    return reminder;
  }

  /**
   * Crée un nouveau rappel de recours
   */
  async create(dto: CreateAppealReminderDto, userId: string) {
    const reminder = await this.prisma.rappelRecours.create({
      data: {
        affaireId: dto.affaireId,
        dateLimite: new Date(dto.dateLimite),
        notes: dto.notes,
        resultatAudienceId: dto.resultatAudienceId,
        createurId: userId,
      },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
        resultatAudience: {
          include: {
            audience: true,
          },
        },
      },
    });

    await this.auditService.log(
      'RappelRecours',
      reminder.id,
      'CREATION',
      null,
      JSON.stringify(reminder),
      userId,
    );

    return reminder;
  }

  /**
   * Met à jour un rappel de recours
   */
  async update(id: string, dto: UpdateAppealReminderDto, userId: string) {
    const oldReminder = await this.findOne(id);

    const updated = await this.prisma.rappelRecours.update({
      where: { id },
      data: {
        ...(dto.dateLimite && { dateLimite: new Date(dto.dateLimite) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.estEffectue !== undefined && {
          estEffectue: dto.estEffectue,
          dateEffectue: dto.estEffectue ? new Date() : null,
        }),
      },
      include: {
        affaire: {
          include: {
            parties: true,
          },
        },
        resultatAudience: {
          include: {
            audience: true,
          },
        },
      },
    });

    await this.auditService.log(
      'RappelRecours',
      id,
      'MODIFICATION',
      JSON.stringify(oldReminder),
      JSON.stringify(updated),
      userId,
    );

    return updated;
  }

  /**
   * Marque un rappel comme effectué
   */
  async markComplete(id: string, userId: string) {
    return this.update(id, { estEffectue: true }, userId);
  }

  /**
   * Supprime un rappel de recours
   */
  async remove(id: string, userId: string) {
    const reminder = await this.findOne(id);

    await this.prisma.rappelRecours.delete({
      where: { id },
    });

    await this.auditService.log(
      'RappelRecours',
      id,
      'SUPPRESSION',
      JSON.stringify(reminder),
      null,
      userId,
    );

    return { message: 'Rappel de recours supprimé avec succès' };
  }

  /**
   * Calcule la date limite par défaut (10 jours après le délibéré)
   */
  calculateDefaultDeadline(deliberationDate: Date): Date {
    const deadline = new Date(deliberationDate);
    deadline.setDate(deadline.getDate() + 10);
    deadline.setHours(23, 59, 59, 999);
    return deadline;
  }
}
