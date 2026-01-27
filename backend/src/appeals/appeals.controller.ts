import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppealsService } from './appeals.service';
import { CreateAppealReminderDto, UpdateAppealReminderDto } from './dto/appeal.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('appeals')
@ApiBearerAuth('JWT-auth')
@Controller('appeals')
@UseGuards(JwtAuthGuard)
export class AppealsController {
  constructor(private readonly appealsService: AppealsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les rappels de recours actifs avec pagination optionnelle' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Éléments par page (défaut: 10, max: 100)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des rappels de recours (paginée si page/limit fournis)',
  })
  findAll(@Query() pagination?: PaginationDto) {
    // Si page ou limit est fourni, utiliser la pagination
    if (pagination?.page || pagination?.limit) {
      return this.appealsService.findAll(pagination);
    }
    // Sinon, retourner toutes les données (rétrocompatibilité)
    return this.appealsService.findAll();
  }

  @Get('completed')
  findCompleted() {
    return this.appealsService.findCompleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appealsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAppealReminderDto, @Request() req: any) {
    return this.appealsService.create(dto, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppealReminderDto,
    @Request() req: any,
  ) {
    return this.appealsService.update(id, dto, req.user.userId);
  }

  @Put(':id/complete')
  markComplete(@Param('id') id: string, @Request() req: any) {
    return this.appealsService.markComplete(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.appealsService.remove(id, req.user.userId);
  }
}
