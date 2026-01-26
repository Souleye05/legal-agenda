import { IsString, IsUUID, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAppealReminderDto {
  @IsUUID()
  affaireId: string;

  @IsDateString()
  dateLimite: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  resultatAudienceId?: string;
}

export class UpdateAppealReminderDto {
  @IsOptional()
  @IsDateString()
  dateLimite?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkAppealCompleteDto {
  @IsBoolean()
  completed: boolean;
}
