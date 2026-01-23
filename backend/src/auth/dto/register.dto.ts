import { IsEmail, IsString, MinLength, MaxLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adresse email de l\'utilisateur',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mot de passe (min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(128, { message: 'Le mot de passe ne peut pas dépasser 128 caractères' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)',
    },
  )
  password: string;

  @ApiProperty({
    example: 'Jean Dupont',
    description: 'Nom complet de l\'utilisateur',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Le nom complet doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le nom complet doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom complet ne peut pas dépasser 100 caractères' })
  fullName: string;
}
