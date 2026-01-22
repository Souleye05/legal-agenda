import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.utilisateur.findMany({
      select: {
        id: true,
        email: true,
        nomComplet: true,
        role: true,
        estActif: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email },
    });
  }

  async create(data: { email: string; motDePasse: string; nomComplet: string; role: 'ADMIN' | 'COLLABORATEUR' }) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    return this.prisma.utilisateur.create({
      data,
    });
  }

  async update(id: string, data: Partial<{ nomComplet: string; estActif: boolean }>) {
    return this.prisma.utilisateur.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nomComplet: true,
        role: true,
        estActif: true,
      },
    });
  }

  /**
   * Met à jour la date de dernière connexion et les informations de contexte
   */
  async updateLastLogin(userId: string, ip?: string, userAgent?: string) {
    return this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        lastLoginUserAgent: userAgent,
      },
    });
  }

  /**
   * Met à jour le refresh token hashé de l'utilisateur
   */
  async updateRefreshToken(userId: string, refreshToken: string | null) {
    const data: any = {
      refreshToken,
    };

    if (refreshToken) {
      // Expiration dans 7 jours
      data.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else {
      data.refreshTokenExpiresAt = null;
    }

    return this.prisma.utilisateur.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Met à jour le token de réinitialisation de mot de passe
   */
  async updatePasswordResetToken(userId: string, token: string | null, expires?: Date) {
    return this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires || null,
      },
    });
  }

  /**
   * Trouve un utilisateur par son token de réinitialisation
   */
  async findByPasswordResetToken(token: string) {
    return this.prisma.utilisateur.findUnique({
      where: { passwordResetToken: token },
    });
  }

  /**
   * Met à jour le mot de passe d'un utilisateur
   */
  async updatePassword(userId: string, hashedPassword: string) {
    return this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        motDePasse: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }
}
