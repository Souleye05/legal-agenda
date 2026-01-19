import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class CreateHearingDto {
  @IsString()
  caseId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsEnum(['MISE_EN_ETAT', 'PLAIDOIRIE', 'REFERE', 'EVOCATION', 'CONCILIATION', 'MEDIATION', 'AUTRE'])
  type: 'MISE_EN_ETAT' | 'PLAIDOIRIE' | 'REFERE' | 'EVOCATION' | 'CONCILIATION' | 'MEDIATION' | 'AUTRE';

  @IsOptional()
  @IsString()
  preparationNotes?: string;
}

export class UpdateHearingDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsEnum(['MISE_EN_ETAT', 'PLAIDOIRIE', 'REFERE', 'EVOCATION', 'CONCILIATION', 'MEDIATION', 'AUTRE'])
  type?: 'MISE_EN_ETAT' | 'PLAIDOIRIE' | 'REFERE' | 'EVOCATION' | 'CONCILIATION' | 'MEDIATION' | 'AUTRE';

  @IsOptional()
  @IsString()
  preparationNotes?: string;

  @IsOptional()
  @IsBoolean()
  isPrepared?: boolean;
}

export class RecordResultDto {
  @IsEnum(['RENVOI', 'RADIATION', 'DELIBERE'])
  type: 'RENVOI' | 'RADIATION' | 'DELIBERE';

  // For RENVOI
  @IsOptional()
  @IsDateString()
  newDate?: string;

  @IsOptional()
  @IsString()
  postponementReason?: string;

  // For RADIATION
  @IsOptional()
  @IsString()
  radiationReason?: string;

  // For DELIBERE
  @IsOptional()
  @IsString()
  deliberationText?: string;
}
