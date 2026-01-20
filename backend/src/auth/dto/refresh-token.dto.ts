import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token JWT',
  })
  @IsString({ message: 'Le refresh token doit être une chaîne de caractères' })
  @MinLength(20, { message: 'Le refresh token est invalide' })
  refreshToken: string;
}
