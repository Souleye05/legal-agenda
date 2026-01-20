import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';

@ApiTags('cases')
@ApiBearerAuth('JWT-auth')
@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les affaires' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'CLOTUREE', 'RADIEE'] })
  @ApiResponse({ status: 200, description: 'Liste des affaires' })
  findAll(@Query('status') status?: string) {
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
  update(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
    return this.casesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une affaire' })
  @ApiResponse({ status: 200, description: 'Affaire supprimée' })
  @ApiResponse({ status: 404, description: 'Affaire non trouvée' })
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }
}
