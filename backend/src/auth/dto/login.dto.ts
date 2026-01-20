import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@legalagenda.com',
    description: 'Adresse email',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  email: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Mot de passe',
  })
  @IsString()
  @MinLength(1, { message: 'Le mot de passe ne peut pas être vide' })
  password: string;
}
