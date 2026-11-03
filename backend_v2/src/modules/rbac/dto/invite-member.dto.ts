import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({ description: 'Phone number of a registered user' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    description: 'Role ID offered to the user (defaults to Property Manager)',
  })
  @IsOptional()
  @IsString()
  roleId?: string;
}
