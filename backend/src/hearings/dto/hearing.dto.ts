import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class CreateHearingDto {
  @IsString()
  affaireId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  heure?: string;

  @IsEnum(['MISE_EN_ETAT', 'PLAIDOIRIE', 'REFERE', 'EVOCATION', 'CONCILIATION', 'MEDIATION', 'AUTRE'])
  type: 'MISE_EN_ETAT' | 'PLAIDOIRIE' | 'REFERE' | 'EVOCATION' | 'CONCILIATION' | 'MEDIATION' | 'AUTRE';

  @IsOptional()
  @IsString()
  notesPreparation?: string;

  @IsOptional()
  @IsBoolean()
  rappelEnrolement?: boolean;
}

export class UpdateHearingDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  heure?: string;

  @IsOptional()
  @IsEnum(['MISE_EN_ETAT', 'PLAIDOIRIE', 'REFERE', 'EVOCATION', 'CONCILIATION', 'MEDIATION', 'AUTRE'])
  type?: 'MISE_EN_ETAT' | 'PLAIDOIRIE' | 'REFERE' | 'EVOCATION' | 'CONCILIATION' | 'MEDIATION' | 'AUTRE';

  @IsOptional()
  @IsString()
  notesPreparation?: string;

  @IsOptional()
  @IsBoolean()
  estPreparee?: boolean;

  @IsOptional()
  @IsBoolean()
  rappelEnrolement?: boolean;
}

export class RecordResultDto {
  @IsEnum(['RENVOI', 'RADIATION', 'DELIBERE'])
  type: 'RENVOI' | 'RADIATION' | 'DELIBERE';

  // For RENVOI
  @IsOptional()
  @IsDateString()
  nouvelleDate?: string;

  @IsOptional()
  @IsString()
  motifRenvoi?: string;

  // For RADIATION
  @IsOptional()
  @IsString()
  motifRadiation?: string;

  // For DELIBERE
  @IsOptional()
  @IsString()
  texteDelibere?: string;
}
