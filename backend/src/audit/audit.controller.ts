import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('audit')
@ApiBearerAuth('JWT-auth')
@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Journal d\'audit complet' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre de résultats (défaut: 100)' })
  @ApiResponse({ status: 200, description: 'Historique des actions' })
  findAll(@Query('limit') limit?: string) {
    return this.auditService.findAll(limit ? parseInt(limit) : 100);
  }

  @Get('entity')
  @ApiOperation({ summary: 'Historique d\'une entité spécifique' })
  @ApiQuery({ name: 'type', required: true, description: 'Type d\'entité (Affaire, Audience, etc.)' })
  @ApiQuery({ name: 'id', required: true, description: 'ID de l\'entité' })
  @ApiResponse({ status: 200, description: 'Historique de l\'entité' })
  findByEntity(@Query('type') type: string, @Query('id') id: string) {
    return this.auditService.findByEntity(type, id);
  }
}
