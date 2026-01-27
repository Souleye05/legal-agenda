import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface BlockedIP {
  attempts: number;
  blockedUntil?: Date;
  lastAttempt: Date;
}

@Injectable()
export class IpBlockGuard implements CanActivate {
  private blockedIPs = new Map<string, BlockedIP>();
  private readonly MAX_ATTEMPTS = 5; // Nombre max de tentatives
  private readonly BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes
  private readonly ATTEMPT_WINDOW = 5 * 60 * 1000; // Fenêtre de 5 minutes pour compter les tentatives

  constructor(private reflector: Reflector) {
    // Nettoyer les IPs bloquées expirées toutes les 5 minutes
    setInterval(() => this.cleanupExpiredBlocks(), 5 * 60 * 1000);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);

    if (!ip) {
      return true; // Si on ne peut pas déterminer l'IP, on laisse passer
    }

    const blocked = this.blockedIPs.get(ip);
    const now = new Date();

    // Vérifier si l'IP est actuellement bloquée
    if (blocked?.blockedUntil && blocked.blockedUntil > now) {
      const remainingMinutes = Math.ceil((blocked.blockedUntil.getTime() - now.getTime()) / 60000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Trop de tentatives de connexion échouées. Votre IP est temporairement bloquée. Réessayez dans ${remainingMinutes} minute(s).`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Si le blocage est expiré, réinitialiser
    if (blocked?.blockedUntil && blocked.blockedUntil <= now) {
      this.blockedIPs.delete(ip);
    }

    return true;
  }

  /**
   * Enregistrer une tentative de connexion échouée
   */
  recordFailedAttempt(ip: string): void {
    if (!ip) return;

    const now = new Date();
    const blocked = this.blockedIPs.get(ip);

    if (!blocked) {
      // Première tentative échouée
      this.blockedIPs.set(ip, {
        attempts: 1,
        lastAttempt: now,
      });
      return;
    }

    // Vérifier si la dernière tentative est dans la fenêtre de temps
    const timeSinceLastAttempt = now.getTime() - blocked.lastAttempt.getTime();
    
    if (timeSinceLastAttempt > this.ATTEMPT_WINDOW) {
      // Si la dernière tentative est trop ancienne, réinitialiser le compteur
      this.blockedIPs.set(ip, {
        attempts: 1,
        lastAttempt: now,
      });
      return;
    }

    // Incrémenter le compteur
    blocked.attempts += 1;
    blocked.lastAttempt = now;

    // Si le nombre max de tentatives est atteint, bloquer l'IP
    if (blocked.attempts >= this.MAX_ATTEMPTS) {
      blocked.blockedUntil = new Date(now.getTime() + this.BLOCK_DURATION);
      console.warn(`[SECURITY] IP ${ip} bloquée jusqu'à ${blocked.blockedUntil.toISOString()} après ${blocked.attempts} tentatives échouées`);
    }

    this.blockedIPs.set(ip, blocked);
  }

  /**
   * Réinitialiser le compteur pour une IP (après connexion réussie)
   */
  resetAttempts(ip: string): void {
    if (!ip) return;
    this.blockedIPs.delete(ip);
  }

  /**
   * Obtenir l'IP du client en tenant compte des proxies
   */
  private getClientIp(request: any): string | null {
    // Vérifier les headers de proxy courants
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      // x-forwarded-for peut contenir plusieurs IPs, prendre la première
      return forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return realIp;
    }

    // Fallback sur l'IP de connexion directe
    return request.ip || request.connection?.remoteAddress || null;
  }

  /**
   * Nettoyer les IPs bloquées expirées
   */
  private cleanupExpiredBlocks(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [ip, blocked] of this.blockedIPs.entries()) {
      // Supprimer les IPs dont le blocage est expiré depuis plus d'une heure
      if (blocked.blockedUntil && blocked.blockedUntil.getTime() < now.getTime() - 3600000) {
        this.blockedIPs.delete(ip);
        cleaned++;
      }
      // Supprimer les tentatives anciennes sans blocage
      else if (!blocked.blockedUntil && now.getTime() - blocked.lastAttempt.getTime() > this.ATTEMPT_WINDOW * 2) {
        this.blockedIPs.delete(ip);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[SECURITY] ${cleaned} IP(s) nettoyée(s) du cache de blocage`);
    }
  }

  /**
   * Obtenir les statistiques de blocage (pour monitoring)
   */
  getStats(): { totalBlocked: number; currentlyBlocked: number; totalAttempts: number } {
    const now = new Date();
    let currentlyBlocked = 0;
    let totalAttempts = 0;

    for (const blocked of this.blockedIPs.values()) {
      totalAttempts += blocked.attempts;
      if (blocked.blockedUntil && blocked.blockedUntil > now) {
        currentlyBlocked++;
      }
    }

    return {
      totalBlocked: this.blockedIPs.size,
      currentlyBlocked,
      totalAttempts,
    };
  }
}
