import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    example: true,
    description: 'Statut d\'activation du compte',
  })
  @IsBoolean({ message: 'Le statut doit être un booléen' })
  estActif: boolean;
}
