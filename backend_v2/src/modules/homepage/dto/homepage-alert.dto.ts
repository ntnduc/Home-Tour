import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum HomepageAlertType {
  INVOICE_OVERDUE = 'INVOICE_OVERDUE',
  INVOICE_DUE_SOON = 'INVOICE_DUE_SOON',
  CONTRACT_EXPIRING = 'CONTRACT_EXPIRING',
  CONTRACT_PENDING = 'CONTRACT_PENDING',
}

export enum HomepageAlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info',
}

export class HomepageAlertTargetDto {
  @ApiPropertyOptional()
  invoiceId?: string;

  @ApiPropertyOptional()
  contractId?: string;
}

export class HomepageAlertDto {
  @ApiProperty({ description: 'Khóa duy nhất: <type>:<entityId>' })
  id: string;

  @ApiProperty({ enum: HomepageAlertType })
  type: HomepageAlertType;

  @ApiProperty({ enum: HomepageAlertSeverity })
  severity: HomepageAlertSeverity;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  roomId: string;

  @ApiProperty()
  roomName: string;

  @ApiProperty()
  propertyName: string;

  @ApiPropertyOptional()
  amount?: number;

  @ApiProperty({ description: 'Ngày mốc (YYYY-MM-DD): hạn thanh toán/hết hạn' })
  date: string;

  @ApiProperty({ type: HomepageAlertTargetDto })
  target: HomepageAlertTargetDto;
}

export class HomepageAlertListDto {
  @ApiProperty({ type: [HomepageAlertDto] })
  items: HomepageAlertDto[];

  @ApiProperty({ description: 'Tổng số cảnh báo (trước khi cắt theo limit)' })
  total: number;
}
