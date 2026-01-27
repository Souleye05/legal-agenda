import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('cases')
@ApiBearerAuth('JWT-auth')
@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les affaires avec pagination optionnelle' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'CLOTUREE', 'RADIEE'] })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Éléments par page (défaut: 10, max: 100)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des affaires (paginée si page/limit fournis)',
    schema: {
      oneOf: [
        {
          type: 'array',
          description: 'Liste simple (sans pagination)',
        },
        {
          type: 'object',
          description: 'Résultat paginé',
          properties: {
            data: { type: 'array' },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
                hasNextPage: { type: 'boolean' },
                hasPreviousPage: { type: 'boolean' },
              },
            },
          },
        },
      ],
    },
  })
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Convertir en nombres et vérifier si fournis
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    
    // Log pour debug
    console.log('[CasesController] findAll called with:', { 
      status, 
      page: pageNum, 
      limit: limitNum,
      hasPagination: pageNum !== undefined || limitNum !== undefined 
    });
    
    // Si page ou limit est explicitement fourni, utiliser la pagination
    if (pageNum !== undefined || limitNum !== undefined) {
      console.log('[CasesController] Using pagination');
      const pagination: PaginationDto = {
        page: pageNum || 1,
        limit: limitNum || 10,
      };
      return this.casesService.findAll(status, pagination);
    }
    
    // Sinon, retourner toutes les données (rétrocompatibilité)
    console.log('[CasesController] Returning all data (no pagination)');
    return this.casesService.findAll(status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des affaires' })
  @ApiResponse({ status: 200, description: 'Statistiques (actives, clôturées, radiées)' })
  getStats() {
    return this.casesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'une affaire' })
  @ApiResponse({ status: 200, description: 'Affaire trouvée' })
  @ApiResponse({ status: 404, description: 'Affaire non trouvée' })
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle affaire' })
  @ApiResponse({ status: 201, description: 'Affaire créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() dto: CreateCaseDto, @CurrentUser() user: any) {
    return this.casesService.create(dto, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une affaire' })
  @ApiResponse({ status: 200, description: 'Affaire modifiée' })
  @ApiResponse({ status: 404, description: 'Affaire non trouvée' })
  update(@Param('id') id: string, @Body() dto: UpdateCaseDto, @CurrentUser() user: any) {
    return this.casesService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer une affaire (Admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Affaire supprimée' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Affaire non trouvée' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.casesService.remove(id, user.userId);
  }
}
