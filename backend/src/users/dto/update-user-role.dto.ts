import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: ['ADMIN', 'COLLABORATEUR'],
    description: 'Rôle de l\'utilisateur',
  })
  @IsEnum(['ADMIN', 'COLLABORATEUR'], { message: 'Rôle invalide. Doit être ADMIN ou COLLABORATEUR' })
  role: 'ADMIN' | 'COLLABORATEUR';
}
