import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ProfileSettingsUpdateDto {
  @ApiPropertyOptional()
  @IsBoolean({ message: 'invoiceReminder phải là true/false' })
  @IsOptional()
  invoiceReminder?: boolean;

  @ApiPropertyOptional()
  @IsBoolean({ message: 'contractExpiryReminder phải là true/false' })
  @IsOptional()
  contractExpiryReminder?: boolean;

  @ApiPropertyOptional()
  @IsBoolean({ message: 'paymentReceived phải là true/false' })
  @IsOptional()
  paymentReceived?: boolean;
}
