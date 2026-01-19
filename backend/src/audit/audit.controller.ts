import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.auditService.findAll(limit ? parseInt(limit) : 100);
  }

  @Get('entity')
  findByEntity(@Query('type') type: string, @Query('id') id: string) {
    return this.auditService.findByEntity(type, id);
  }
}
