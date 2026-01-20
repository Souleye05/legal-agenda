import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface LoginContext {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12; // OWASP 2024 recommendation

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Valide les identifiants de l'utilisateur
   * @throws UnauthorizedException si les identifiants sont invalides
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      this.logger.warn(`Tentative de connexion avec un email inexistant: ${email}`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.motDePasse);

    if (!isPasswordValid) {
      this.logger.warn(`Tentative de mot de passe échouée pour l'utilisateur: ${user.id}`);
      // Log failed attempt for security monitoring
      await this.logFailedLogin(user.id);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.estActif) {
      this.logger.warn(`Tentative de connexion d'un compte inactif: ${user.id}`);
      throw new UnauthorizedException('Votre compte a été désactivé. Veuillez contacter l\'administrateur.');
    }

    const { motDePasse: _, passwordResetToken: __, passwordResetExpires: ___, ...result } = user;
    return result;
  }

  /**
   * Génère les tokens JWT et enregistre la connexion réussie
   */
  async login(user: any, context?: LoginContext) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    // Hash and store refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    // Update last login with context
    await this.usersService.updateLastLogin(user.id, context?.ip, context?.userAgent);

    // Audit log
    await this.logSuccessfulLogin(user.id, context);

    this.logger.log(`Utilisateur connecté avec succès: ${user.email}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.nomComplet,
        role: user.role,
      },
    };
  }

  /**
   * Inscription d'un nouvel utilisateur avec validation
   */
  async register(dto: RegisterDto, context?: LoginContext) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    // Validate password strength (additional check beyond DTO validation)
    this.validatePasswordStrength(dto.password);

    // Hash password with secure rounds
    const hashedPassword = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

    // Create user
    const user = await this.usersService.create({
      email: dto.email,
      motDePasse: hashedPassword,
      nomComplet: dto.fullName,
      role: dto.role || 'COLLABORATEUR',
    });

    this.logger.log(`Nouvel utilisateur inscrit: ${user.email}`);

    // Auto-login after registration
    const { motDePasse: _, passwordResetToken: __, passwordResetExpires: ___, ...result } = user;
    return this.login(result, context);
  }

  /**
   * Renouvelle l'access token en utilisant le refresh token
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findByEmail(payload.email);

      if (!user || !user.estActif) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      // Verify stored refresh token matches
      const isValidRefreshToken = await bcrypt.compare(
        refreshToken,
        user.refreshToken || '',
      );

      if (!isValidRefreshToken) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      // Check expiration
      if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expiré');
      }

      // Generate new access token
      const newPayload = { email: user.email, sub: user.id, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
      });

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      this.logger.error(`Erreur refresh token: ${error.message}`);
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  /**
   * Déconnexion de l'utilisateur en invalidant le refresh token
   */
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    
    await this.prisma.journalAudit.create({
      data: {
        typeEntite: 'Utilisateur',
        idEntite: userId,
        action: 'SUPPRESSION', // Utilisé pour logout
        utilisateurId: userId,
        nouvelleValeur: JSON.stringify({ action: 'LOGOUT', timestamp: new Date() }),
      },
    });

    this.logger.log(`Utilisateur déconnecté: ${userId}`);
    
    return { message: 'Déconnexion réussie' };
  }

  /**
   * Valide la force du mot de passe au-delà de la validation DTO
   */
  private validatePasswordStrength(password: string): void {
    // Common weak passwords
    const weakPasswords = [
      'password', '12345678', 'qwerty', 'admin123', 'password123',
      'letmein', 'welcome', 'monkey', 'dragon', 'master',
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
      throw new ConflictException('Ce mot de passe est trop commun et facilement devinable');
    }

    // Check for repeated characters (e.g., "aaaa1111")
    if (/(.)\1{3,}/.test(password)) {
      throw new ConflictException('Le mot de passe ne doit pas contenir de caractères répétés');
    }

    // Check for sequential patterns
    const sequences = ['abc', '123', 'qwe', 'asd', 'zxc'];
    if (sequences.some(seq => password.toLowerCase().includes(seq))) {
      throw new ConflictException('Le mot de passe ne doit pas contenir de séquences simples');
    }
  }

  /**
   * Enregistre une connexion réussie dans l'audit trail
   */
  private async logSuccessfulLogin(userId: string, context?: LoginContext) {
    await this.prisma.journalAudit.create({
      data: {
        typeEntite: 'Utilisateur',
        idEntite: userId,
        action: 'CREATION', // Utilisé pour login success
        utilisateurId: userId,
        nouvelleValeur: JSON.stringify({
          action: 'LOGIN_SUCCESS',
          ip: context?.ip,
          userAgent: context?.userAgent,
          timestamp: new Date(),
        }),
      },
    });
  }

  /**
   * Enregistre une tentative de connexion échouée pour la surveillance de sécurité
   */
  private async logFailedLogin(userId: string) {
    await this.prisma.journalAudit.create({
      data: {
        typeEntite: 'Utilisateur',
        idEntite: userId,
        action: 'MODIFICATION', // Utilisé pour login failed
        utilisateurId: userId,
        nouvelleValeur: JSON.stringify({ 
          action: 'LOGIN_FAILED',
          timestamp: new Date() 
        }),
      },
    });
  }
}
