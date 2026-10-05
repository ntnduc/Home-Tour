import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HomepageAlertListDto } from './dto/homepage-alert.dto';
import {
  HomepageListQueryDto,
  HomepageQueryDto,
} from './dto/homepage-query.dto';
import { HomepageRoomFeedItemDto } from './dto/homepage-room-feed.dto';
import { HomepageSummaryDto } from './dto/homepage-summary.dto';
import { HomepageService } from './homepage.service';

/**
 * API trang chủ — tách 3 endpoint nhỏ để app gọi SONG SONG,
 * mỗi section trên UI hiển thị ngay khi dữ liệu của nó về.
 * Phạm vi dữ liệu tự giới hạn theo tài sản user được truy cập (HomepageScopeService).
 */
@ApiTags('Homepage')
@ApiBearerAuth()
@Controller('api/homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Số liệu tổng quan: phòng, khách, doanh thu tháng' })
  @ApiOkResponse({ type: HomepageSummaryDto })
  getSummary(@Query() query: HomepageQueryDto) {
    return this.homepageService.getSummary(query.propertyId);
  }

  @Get('room-feed')
  @ApiOperation({ summary: 'Danh sách phòng cần chú ý (carousel)' })
  @ApiOkResponse({ type: [HomepageRoomFeedItemDto] })
  getRoomFeed(@Query() query: HomepageListQueryDto) {
    return this.homepageService.getRoomFeed(query.propertyId, query.limit);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Cảnh báo cần xử lý gấp' })
  @ApiOkResponse({ type: HomepageAlertListDto })
  getAlerts(@Query() query: HomepageListQueryDto) {
    return this.homepageService.getAlerts(query.propertyId, query.limit);
  }
}
