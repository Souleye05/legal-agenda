import { IsString, IsDateString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

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

  @IsOptional()
  @IsBoolean()
  estEffectue?: boolean;
}
