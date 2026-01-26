import { Module } from '@nestjs/common';
import { HearingsService } from './hearings.service';
import { HearingsController } from './hearings.controller';
import { CasesModule } from '../cases/cases.module';
import { AuditModule } from '../audit/audit.module';
import { AlertsModule } from '../alerts/alerts.module';
import { AppealsModule } from '../appeals/appeals.module';

@Module({
  imports: [CasesModule, AuditModule, AlertsModule, AppealsModule],
  providers: [HearingsService],
  controllers: [HearingsController],
  exports: [HearingsService],
})
export class HearingsModule {}
