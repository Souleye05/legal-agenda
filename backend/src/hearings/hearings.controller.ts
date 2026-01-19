import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { HearingsService } from './hearings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateHearingDto, UpdateHearingDto, RecordResultDto } from './dto/hearing.dto';

@Controller('hearings')
@UseGuards(JwtAuthGuard)
export class HearingsController {
  constructor(private hearingsService: HearingsService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('caseId') caseId?: string) {
    return this.hearingsService.findAll(status, caseId);
  }

  @Get('unreported')
  getUnreported() {
    return this.hearingsService.getUnreported();
  }

  @Get('tomorrow')
  getTomorrow() {
    return this.hearingsService.getTomorrow();
  }

  @Get('calendar')
  getCalendar(@Query('month') month?: string, @Query('year') year?: string) {
    return this.hearingsService.getCalendar(month, year);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hearingsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateHearingDto, @CurrentUser() user: any) {
    return this.hearingsService.create(dto, user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHearingDto) {
    return this.hearingsService.update(id, dto);
  }

  @Post(':id/result')
  recordResult(@Param('id') id: string, @Body() dto: RecordResultDto, @CurrentUser() user: any) {
    return this.hearingsService.recordResult(id, dto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hearingsService.remove(id);
  }
}
