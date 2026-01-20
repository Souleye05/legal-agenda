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
    this.transporter = nodemailer.createTransport({
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
    return this.prisma.alerte.create({
      data: {
        audienceId: hearingId,
        statut: 'EN_ATTENTE',
      },
    });
  }

  async getPendingAlerts() {
    return this.prisma.alerte.findMany({
      where: {
        statut: 'EN_ATTENTE',
      },
      include: {
        audience: {
          include: {
            affaire: {
              include: {
                parties: true,
                createur: true,
              },
            },
          },
        },
      },
    });
  }

  async sendAlert(alertId: string) {
    const alert = await this.prisma.alerte.findUnique({
      where: { id: alertId },
      include: {
        audience: {
          include: {
            affaire: {
              include: {
                parties: true,
                createur: true,
              },
            },
          },
        },
      },
    });

    if (!alert) return;

    const { audience } = alert;
    const { affaire: caseData } = audience;

    const parties = caseData.parties.map(p => p.nom).join(' / ');
    const dateStr = audience.date.toLocaleDateString('fr-FR');

    const subject = `⚠️ Audience non renseignée - ${caseData.reference}`;
    const message = `
      <h2>Audience non renseignée</h2>
      <p><strong>Affaire:</strong> ${caseData.reference} - ${caseData.titre}</p>
      <p><strong>Parties:</strong> ${parties}</p>
      <p><strong>Juridiction:</strong> ${caseData.juridiction} - ${caseData.chambre}</p>
      <p><strong>Date de l'audience:</strong> ${dateStr}</p>
      <p><strong>Type:</strong> ${audience.type}</p>
      <br>
      <p>Cette audience doit être renseignée dans le système.</p>
      <p><a href="${this.configService.get('FRONTEND_URL')}/a-renseigner">Renseigner maintenant</a></p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: caseData.createur.email,
        subject,
        html: message,
      });

      await this.prisma.alerte.update({
        where: { id: alertId },
        data: {
          statut: 'ENVOYEE',
          nombreEnvois: { increment: 1 },
          dernierEnvoiLe: new Date(),
        },
      });

      console.log(`✅ Alert sent for hearing ${audience.id}`);
    } catch (error) {
      console.error(`❌ Failed to send alert for hearing ${audience.id}:`, error);
    }
  }

  async resolveAlertsForHearing(hearingId: string) {
    await this.prisma.alerte.updateMany({
      where: {
        audienceId: hearingId,
        statut: { in: ['EN_ATTENTE', 'ENVOYEE'] },
      },
      data: {
        statut: 'RESOLUE',
        resoleLe: new Date(),
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
