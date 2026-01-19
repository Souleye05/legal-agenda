import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.casesService.findAll(status);
  }

  @Get('stats')
  getStats() {
    return this.casesService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCaseDto, @CurrentUser() user: any) {
    return this.casesService.create(dto, user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
    return this.casesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }
}
