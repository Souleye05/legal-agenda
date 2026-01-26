import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppealsService } from './appeals.service';
import { CreateAppealReminderDto, UpdateAppealReminderDto } from './dto/appeal.dto';

@Controller('appeals')
@UseGuards(JwtAuthGuard)
export class AppealsController {
  constructor(private readonly appealsService: AppealsService) {}

  @Get()
  findAll() {
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
