import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus } from 'src/common/enums/room.enum';
import {
  RoomActionPayload,
  RoomActionSeverity,
  RoomActionType,
} from 'src/modules/property/dto/room-dto/room-action.dto';

export class HomepageRoomActionDto {
  @ApiProperty({ enum: RoomActionType })
  type: RoomActionType;

  @ApiProperty()
  label: string;

  @ApiProperty({ enum: RoomActionSeverity })
  severity: RoomActionSeverity;

  @ApiProperty()
  payload: RoomActionPayload;
}

export class HomepageRoomFeedItemDto {
  @ApiProperty()
  roomId: string;

  @ApiProperty()
  roomName: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  propertyName: string;

  @ApiProperty({ enum: RoomStatus })
  status: RoomStatus;

  @ApiProperty()
  rentAmount: number;

  @ApiPropertyOptional()
  tenantName?: string;

  @ApiPropertyOptional({ type: HomepageRoomActionDto })
  topAction?: HomepageRoomActionDto;

  @ApiProperty()
  pendingTaskCount: number;

  @ApiProperty()
  hasOverdueAlert: boolean;
}
