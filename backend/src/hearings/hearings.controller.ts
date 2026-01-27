import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HearingsService } from './hearings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateHearingDto, UpdateHearingDto, RecordResultDto } from './dto/hearing.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('hearings')
@ApiBearerAuth('JWT-auth')
@Controller('hearings')
@UseGuards(JwtAuthGuard)
export class HearingsController {
  constructor(private hearingsService: HearingsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les audiences avec pagination optionnelle' })
  @ApiQuery({ name: 'status', required: false, enum: ['A_VENIR', 'TENUE', 'NON_RENSEIGNEE'] })
  @ApiQuery({ name: 'caseId', required: false, description: 'ID de l\'affaire' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Éléments par page (défaut: 10, max: 100)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des audiences (paginée si page/limit fournis)',
  })
  findAll(
    @Query('status') status?: string,
    @Query('caseId') caseId?: string,
    @Query() pagination?: PaginationDto,
  ) {
    // Si page ou limit est fourni, utiliser la pagination
    if (pagination?.page || pagination?.limit) {
      return this.hearingsService.findAll(status, caseId, pagination);
    }
    // Sinon, retourner toutes les données (rétrocompatibilité)
    return this.hearingsService.findAll(status, caseId);
  }

  @Get('unreported')
  @ApiOperation({ summary: 'Audiences passées non renseignées' })
  @ApiResponse({ status: 200, description: 'Liste des audiences à renseigner' })
  getUnreported() {
    return this.hearingsService.getUnreported();
  }

  @Get('tomorrow')
  @ApiOperation({ summary: 'Audiences de demain' })
  @ApiResponse({ status: 200, description: 'Liste des audiences de demain' })
  getTomorrow() {
    return this.hearingsService.getTomorrow();
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Calendrier des audiences' })
  @ApiQuery({ name: 'month', required: false, description: 'Mois (1-12)' })
  @ApiQuery({ name: 'year', required: false, description: 'Année' })
  @ApiResponse({ status: 200, description: 'Audiences du mois' })
  getCalendar(@Query('month') month?: string, @Query('year') year?: string) {
    return this.hearingsService.getCalendar(month, year);
  }

  @Get('enrollment-reminders')
  @ApiOperation({ summary: 'Rappels d\'enrôlement actifs' })
  @ApiResponse({ status: 200, description: 'Liste des rappels d\'enrôlement' })
  getEnrollmentReminders() {
    return this.hearingsService.getEnrollmentReminders();
  }

  @Get('enrollment-reminders/completed')
  @ApiOperation({ summary: 'Enrôlements effectués' })
  @ApiResponse({ status: 200, description: 'Liste des enrôlements effectués' })
  getCompletedEnrollments() {
    return this.hearingsService.getCompletedEnrollments();
  }

  @Patch(':id/enrollment-complete')
  @ApiOperation({ summary: 'Marquer l\'enrôlement comme effectué' })
  @ApiResponse({ status: 200, description: 'Enrôlement marqué comme effectué' })
  @ApiResponse({ status: 400, description: 'Pas de rappel d\'enrôlement activé' })
  @ApiResponse({ status: 404, description: 'Audience non trouvée' })
  markEnrollmentComplete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.hearingsService.markEnrollmentComplete(id, user.userId);
  }

  @Patch(':id/enable-enrollment-reminder')
  @ApiOperation({ summary: 'Activer le rappel d\'enrôlement manuellement' })
  @ApiResponse({ status: 200, description: 'Rappel d\'enrôlement activé' })
  @ApiResponse({ status: 404, description: 'Audience non trouvée' })
  enableEnrollmentReminder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.hearingsService.enableEnrollmentReminder(id, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'une audience' })
  @ApiResponse({ status: 200, description: 'Audience trouvée' })
  @ApiResponse({ status: 404, description: 'Audience non trouvée' })
  findOne(@Param('id') id: string) {
    return this.hearingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle audience' })
  @ApiResponse({ status: 201, description: 'Audience créée' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() dto: CreateHearingDto, @CurrentUser() user: any) {
    return this.hearingsService.create(dto, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une audience' })
  @ApiResponse({ status: 200, description: 'Audience modifiée' })
  @ApiResponse({ status: 404, description: 'Audience non trouvée' })
  update(@Param('id') id: string, @Body() dto: UpdateHearingDto) {
    return this.hearingsService.update(id, dto);
  }

  @Post(':id/result')
  @ApiOperation({ summary: 'Renseigner le résultat d\'une audience' })
  @ApiResponse({ status: 201, description: 'Résultat enregistré (RENVOI/RADIATION/DELIBERE)' })
  @ApiResponse({ status: 400, description: 'Résultat déjà enregistré' })
  @ApiResponse({ status: 404, description: 'Audience non trouvée' })
  recordResult(@Param('id') id: string, @Body() dto: RecordResultDto, @CurrentUser() user: any) {
    return this.hearingsService.recordResult(id, dto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une audience' })
  @ApiResponse({ status: 200, description: 'Audience supprimée' })
  @ApiResponse({ status: 404, description: 'Audience non trouvée' })
  remove(@Param('id') id: string) {
    return this.hearingsService.remove(id);
  }
}
