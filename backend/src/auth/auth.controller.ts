import { 
  Controller, 
  Post, 
  Get,
  Body, 
  UseGuards, 
  Request,
  Ip,
  Headers,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives par minute
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie, retourne access_token et refresh_token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          fullName: 'Jean Dupont',
          role: 'COLLABORATEUR',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives, réessayez plus tard' })
  async login(@Request() req) {
    // Extraire IP et User-Agent de la requête
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    return this.authService.login(req.user, { ip, userAgent });
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 inscriptions par minute
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Utilisateur créé avec succès, connecté automatiquement',
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives, réessayez plus tard' })
  async register(@Body() dto: RegisterDto, @Request() req) {
    // Extraire IP et User-Agent de la requête
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    return this.authService.register(dto, { ip, userAgent });
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 renouvellements par minute
  @ApiOperation({ summary: 'Renouveler l\'access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Nouveau access token généré',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives, réessayez plus tard' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Déconnexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Profil de l\'utilisateur connecté' })
  @ApiResponse({ 
    status: 200, 
    description: 'Informations de l\'utilisateur',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        fullName: 'Jean Dupont',
        role: 'COLLABORATEUR',
        isActive: true,
        lastLoginAt: '2026-01-20T10:00:00.000Z',
        createdAt: '2026-01-01T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProfile(@Request() req) {
    const user = await this.authService.getUserProfile(req.user.userId);
    return user;
  }
}
