import { IsString, IsOptional, IsArray, IsEnum, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

class PartyDto {
  @IsString({ message: 'Le nom est obligatoire' })
  @MinLength(1, { message: 'Le nom est obligatoire' })
  @MaxLength(200, { message: 'Le nom ne peut pas dépasser 200 caractères' })
  nom: string;

  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(['DEMANDEUR', 'DEFENDEUR', 'CONSEIL_ADVERSE'], { message: 'Rôle invalide' })
  role: 'DEMANDEUR' | 'DEFENDEUR' | 'CONSEIL_ADVERSE';
}

export class CreateCaseDto {
  @IsString({ message: 'Le numéro de référence est obligatoire' })
  @MinLength(1, { message: 'Le numéro de référence est obligatoire' })
  @MaxLength(50, { message: 'Le numéro de référence ne peut pas dépasser 50 caractères' })
  reference: string;

  @IsString({ message: 'Le titre est obligatoire' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  titre: string;

  @IsArray({ message: 'Les parties sont obligatoires' })
  @ValidateNested({ each: true })
  @Type(() => PartyDto)
  parties: PartyDto[];

  @IsString({ message: 'La juridiction est obligatoire' })
  @MaxLength(100, { message: 'La juridiction ne peut pas dépasser 100 caractères' })
  juridiction: string;

  @IsOptional()
  @IsString({ message: 'La chambre doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La chambre ne peut pas dépasser 100 caractères' })
  chambre?: string;

  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La ville ne peut pas dépasser 100 caractères' })
  ville?: string;

  @IsOptional()
  @IsString({ message: 'Les observations doivent être une chaîne de caractères' })
  @MaxLength(2000, { message: 'Les observations ne peuvent pas dépasser 2000 caractères' })
  observations?: string;
}

export class UpdateCaseDto {
  @IsOptional()
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  titre?: string;

  @IsOptional()
  @IsString({ message: 'La juridiction doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La juridiction ne peut pas dépasser 100 caractères' })
  juridiction?: string;

  @IsOptional()
  @IsString({ message: 'La chambre doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La chambre ne peut pas dépasser 100 caractères' })
  chambre?: string;

  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La ville ne peut pas dépasser 100 caractères' })
  ville?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'CLOTUREE', 'RADIEE'], { message: 'Statut invalide' })
  statut?: 'ACTIVE' | 'CLOTUREE' | 'RADIEE';

  @IsOptional()
  @IsString({ message: 'Les observations doivent être une chaîne de caractères' })
  @MaxLength(2000, { message: 'Les observations ne peuvent pas dépasser 2000 caractères' })
  observations?: string;
}
