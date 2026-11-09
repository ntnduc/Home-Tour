import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseController } from 'src/common/base/crud/base.controller';
import { AutoCrudPermissions } from 'src/common/decorators/crud-permissions.decorator';
import { RoomDetailDto } from './dto/room-dto/room.detail.dto';
import { RoomListDto } from './dto/room-dto/room.list.dto';
import { RoomUpdateDto } from './dto/room-dto/room.update.dto';
import { RoomCreateDto } from './dto/room-dto/rooms.create.dto';
import { Rooms } from './entities/rooms.entity';
import { RoomsService } from './rooms.service';

@ApiTags('Room')
@ApiBearerAuth()
@Controller('api/rooms')
@AutoCrudPermissions('ROOM')
export class RoomsController extends BaseController<
  RoomsService,
  Rooms,
  RoomDetailDto,
  RoomListDto,
  RoomCreateDto,
  RoomUpdateDto
> {
  constructor(private readonly roomsService: RoomsService) {
    super(
      roomsService,
      RoomDetailDto,
      RoomListDto,
      RoomCreateDto,
      RoomUpdateDto,
    );
  }

  @Get('combo-contractable')
  @ApiOperation({ summary: 'Get rooms that can receive a new contract' })
  @ApiResponse({ status: 200, description: 'Room options' })
  async getContractableRoomOptions(@Query('propertyId') propertyId?: string) {
    return await this.roomsService.getContractableRoomOptions(propertyId);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Get room services' })
  @ApiResponse({ status: 200, description: 'Room services' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoomServices(@Param('id') id: string) {
    return await this.roomsService.getRoomServices(id);
  }
}
