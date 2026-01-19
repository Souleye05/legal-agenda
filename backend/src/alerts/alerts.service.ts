import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AlertsService {
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async createAlert(hearingId: string) {
    return this.prisma.alert.create({
      data: {
        hearingId,
        status: 'PENDING',
      },
    });
  }

  async getPendingAlerts() {
    return this.prisma.alert.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        hearing: {
          include: {
            case: {
              include: {
                parties: true,
                createdBy: true,
              },
            },
          },
        },
      },
    });
  }

  async sendAlert(alertId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        hearing: {
          include: {
            case: {
              include: {
                parties: true,
                createdBy: true,
              },
            },
          },
        },
      },
    });

    if (!alert) return;

    const { hearing } = alert;
    const { case: caseData } = hearing;

    const parties = caseData.parties.map(p => p.name).join(' / ');
    const dateStr = hearing.date.toLocaleDateString('fr-FR');

    const subject = `⚠️ Audience non renseignée - ${caseData.reference}`;
    const message = `
      <h2>Audience non renseignée</h2>
      <p><strong>Affaire:</strong> ${caseData.reference} - ${caseData.title}</p>
      <p><strong>Parties:</strong> ${parties}</p>
      <p><strong>Juridiction:</strong> ${caseData.jurisdiction} - ${caseData.chamber}</p>
      <p><strong>Date de l'audience:</strong> ${dateStr}</p>
      <p><strong>Type:</strong> ${hearing.type}</p>
      <br>
      <p>Cette audience doit être renseignée dans le système.</p>
      <p><a href="${this.configService.get('FRONTEND_URL')}/a-renseigner">Renseigner maintenant</a></p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: caseData.createdBy.email,
        subject,
        html: message,
      });

      await this.prisma.alert.update({
        where: { id: alertId },
        data: {
          status: 'SENT',
          sentCount: { increment: 1 },
          lastSentAt: new Date(),
        },
      });

      console.log(`✅ Alert sent for hearing ${hearing.id}`);
    } catch (error) {
      console.error(`❌ Failed to send alert for hearing ${hearing.id}:`, error);
    }
  }

  async resolveAlertsForHearing(hearingId: string) {
    await this.prisma.alert.updateMany({
      where: {
        hearingId,
        status: { in: ['PENDING', 'SENT'] },
      },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
  }

  async sendDailyAlerts() {
    const pendingAlerts = await this.getPendingAlerts();

    console.log(`📧 Sending ${pendingAlerts.length} daily alerts...`);

    for (const alert of pendingAlerts) {
      await this.sendAlert(alert.id);
    }

    return pendingAlerts.length;
  }
}
