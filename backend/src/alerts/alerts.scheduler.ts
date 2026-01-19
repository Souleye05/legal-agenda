import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsScheduler {
  constructor(
    private alertsService: AlertsService,
    private prisma: PrismaService,
  ) {}

  // Run every day at 20:00 (8 PM)
  @Cron('0 20 * * *')
  async handleDailyAlerts() {
    console.log('🔔 Running daily alert check...');

    // Mark unreported hearings
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

      // Check if alert already exists
      const existingAlert = await this.prisma.alert.findFirst({
        where: { hearingId: hearing.id },
      });

      if (!existingAlert) {
        await this.alertsService.createAlert(hearing.id);
      }
    }

    // Send all pending alerts
    const sentCount = await this.alertsService.sendDailyAlerts();

    console.log(`✅ Daily alert check complete. Sent ${sentCount} alerts.`);
  }

  // Optional: Run every hour to check for unreported hearings
  @Cron(CronExpression.EVERY_HOUR)
  async checkUnreportedHearings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.prisma.hearing.count({
      where: {
        date: { lt: today },
        status: 'A_VENIR',
        result: null,
      },
    });

    if (count > 0) {
      console.log(`⚠️ Found ${count} unreported hearings`);
    }
  }
}
