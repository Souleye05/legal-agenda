import { IsString, IsOptional, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PartyDto {
  @IsString()
  name: string;

  @IsEnum(['DEMANDEUR', 'DEFENDEUR', 'CONSEIL_ADVERSE'])
  role: 'DEMANDEUR' | 'DEFENDEUR' | 'CONSEIL_ADVERSE';
}

export class CreateCaseDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartyDto)
  parties: PartyDto[];

  @IsString()
  jurisdiction: string;

  @IsString()
  chamber: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class UpdateCaseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @IsOptional()
  @IsString()
  chamber?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'CLOTUREE', 'RADIEE'])
  status?: 'ACTIVE' | 'CLOTUREE' | 'RADIEE';

  @IsOptional()
  @IsString()
  observations?: string;
}
