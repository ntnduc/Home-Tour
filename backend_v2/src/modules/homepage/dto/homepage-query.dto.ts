import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class HomepageQueryDto {
  @ApiPropertyOptional({
    description:
      'Lọc theo một tài sản. Bỏ trống = tổng hợp mọi tài sản user được truy cập.',
  })
  @IsOptional()
  @IsUUID()
  propertyId?: string;
}

export class HomepageListQueryDto extends HomepageQueryDto {
  @ApiPropertyOptional({ description: 'Số phần tử tối đa', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
