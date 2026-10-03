import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseUpdateDto } from 'src/common/base/dto/update.dto';
import { RoomStatus } from 'src/common/enums/room.enum';
import { Rooms } from '../../entities/rooms.entity';

export class RoomUpdateDto extends BaseUpdateDto<Rooms> {
  @IsString()
  name: string;

  @IsString()
  status: RoomStatus;

  @IsNumber()
  area?: number;

  @IsNumber()
  rentAmount: number;

  @IsNumber()
  maxOccupancy?: number;

  @IsString()
  floor?: string;

  @IsNumber()
  defaultDepositAmount: number;

  @IsNumber()
  defaultPaymentDueDay: number;

  @IsString()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPrepaidRoom?: boolean;

  @IsString()
  @IsOptional()
  imageCollectionId?: string;

  getEntity(): Rooms {
    const entity = new Rooms();
    entity.name = this.name;
    entity.status = this.status;
    entity.area = this.area;
    entity.rentAmount = this.rentAmount;
    entity.maxOccupancy = this.maxOccupancy;
    entity.floor = this.floor;
    entity.defaultDepositAmount = this.defaultDepositAmount;
    entity.defaultPaymentDueDay = this.defaultPaymentDueDay;
    entity.isPrepaidRoom = this.isPrepaidRoom;
    entity.description = this.description;
    // entity.imageCollectionId = this.imageCollectionId
    return entity;
  }
}
