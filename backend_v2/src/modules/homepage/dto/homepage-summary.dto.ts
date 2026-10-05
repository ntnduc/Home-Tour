import { ApiProperty } from '@nestjs/swagger';

export class HomepagePropertyOptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class HomepagePeriodDto {
  @ApiProperty({ description: 'Tháng hiện tại (1-12)' })
  month: number;

  @ApiProperty()
  year: number;
}

export class HomepageRoomStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  occupied: number;

  @ApiProperty()
  available: number;

  @ApiProperty()
  maintenance: number;

  @ApiProperty()
  pendingDeposit: number;

  @ApiProperty()
  unavailable: number;

  @ApiProperty({ description: 'Tỷ lệ lấp đầy 0-100 (đã làm tròn 1 chữ số)' })
  occupancyRate: number;
}

export class HomepageRevenueDto {
  @ApiProperty({ description: 'Tổng phải thu của các hóa đơn kỳ tháng này' })
  expected: number;

  @ApiProperty({ description: 'Đã thu' })
  collected: number;

  @ApiProperty({ description: 'Còn phải thu' })
  outstanding: number;

  @ApiProperty({ description: 'Tỷ lệ thu 0-100 (đã làm tròn 1 chữ số)' })
  collectionRate: number;
}

export class HomepageSummaryDto {
  @ApiProperty({ type: [HomepagePropertyOptionDto] })
  properties: HomepagePropertyOptionDto[];

  @ApiProperty({ type: HomepagePeriodDto })
  period: HomepagePeriodDto;

  @ApiProperty({ type: HomepageRoomStatsDto })
  rooms: HomepageRoomStatsDto;

  @ApiProperty({ description: 'Số khách đang thuê (hợp đồng ACTIVE)' })
  tenantsCount: number;

  @ApiProperty({ type: HomepageRevenueDto })
  revenue: HomepageRevenueDto;

  @ApiProperty()
  overdueInvoiceCount: number;

  @ApiProperty({ description: 'Hợp đồng sắp hết hạn trong 30 ngày tới' })
  expiringContractCount: number;
}
