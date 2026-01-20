import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adresse email pour la réinitialisation du mot de passe',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  email: string;
}
