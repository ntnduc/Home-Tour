import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class SetMemberPermissionDto {
  @ApiProperty({ description: 'Permission id, e.g. ROOM.EDIT' })
  @IsString()
  @IsNotEmpty()
  permission: string;

  @ApiProperty({ description: 'true = enabled, false = disabled' })
  @IsBoolean()
  granted: boolean;
}
