import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsScheduler } from './alerts.scheduler';

@Module({
  providers: [AlertsService, AlertsScheduler],
  exports: [AlertsService],
})
export class AlertsModule {}
