import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base/crud/base.service';
import { ContractStatus } from 'src/common/enums/contract.enum';
import { RoomStatus } from 'src/common/enums/room.enum';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { ContractServiceDetailDto } from '../contract/dto/contract-services-dto/contract-service.detail.dto';
import { ContractsRepository } from '../contract/repositories/contracts.repository';
import { PropertyCreateDto } from './dto/properties-dto/property.create.dto';
import { PropertyDetailDto } from './dto/properties-dto/property.detail.dto';
import { RoomServiceDetailDto } from './dto/room-dto/room-service.detail.dto';
import { RoomDetailDto } from './dto/room-dto/room.detail.dto';
import { RoomListDto } from './dto/room-dto/room.list.dto';
import { RoomUpdateDto } from './dto/room-dto/room.update.dto';
import { RoomCreateDto } from './dto/room-dto/rooms.create.dto';
import { RoomActionSignal } from './entities/room-action-signal.view';
import { Rooms } from './entities/rooms.entity';
import { PropertiesServiceRepository } from './repositories/properties-service.repository';
import { RoomsRepository } from './repositories/rooms.repository';
import { RoomActionService } from './room-action.service';

@Injectable()
export class RoomsService extends BaseService<
  Rooms,
  RoomDetailDto,
  RoomListDto,
  RoomCreateDto,
  RoomUpdateDto
> {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly contractsRepository: ContractsRepository,
    private readonly propertiesServiceRepository: PropertiesServiceRepository,
    private readonly roomActionService: RoomActionService,
    @InjectRepository(RoomActionSignal)
    private readonly roomActionSignalRepository: Repository<RoomActionSignal>,
  ) {
    super(
      roomsRepository,
      RoomDetailDto,
      RoomListDto,
      RoomCreateDto,
      RoomUpdateDto,
    );
  }

  override async specQuery(): Promise<SelectQueryBuilder<Rooms>> {
    const query = this.roomsRepository
      .createQueryBuilder('entity')
      .leftJoinAndSelect(
        'entity.contracts',
        'contracts',
        'contracts.status = :status',
        {
          status: ContractStatus.ACTIVE,
        },
      )
      .leftJoinAndSelect('contracts.contractClient', 'contractClient');
    query.orderBy('property.name', 'ASC');
    return query;
  }

  override async beautifyResult(items: Rooms[]): Promise<RoomListDto[]> {
    items.sort((a, b) => {
      const propCompare = a.property.name.localeCompare(b.property.name);
      if (propCompare !== 0) return propCompare;
      return a.name.localeCompare(b.name);
    });

    const now = new Date();
    const roomIds = items.map((item) => item.id);
    const signals =
      roomIds.length > 0
        ? await this.roomActionSignalRepository.find({
            where: { roomId: In(roomIds) },
          })
        : [];
    const signalMap = new Map(signals.map((signal) => [signal.roomId, signal]));

    return items.map((item) => {
      const listDto = new RoomListDto();
      listDto.fromEntity(item);
      const actionResult = this.roomActionService.computeRoomActions(
        signalMap.get(item.id) ?? {
          roomId: item.id,
          roomStatus: item.status,
        },
        now,
      );
      listDto.actions = actionResult.actions;
      listDto.pendingTaskCount = actionResult.pendingTaskCount;
      listDto.hasOverdueAlert = actionResult.hasOverdueAlert;
      listDto.overdueAlertMessage = actionResult.overdueAlertMessage;
      return listDto;
    });
  }

  override async get(id: string): Promise<RoomDetailDto> {
    const entity = await this.genericRepository.findOne({
      where: {
        id: id as any,
      },
      relations: ['property', 'property.services', 'property.services.service'],
    });

    if (!entity) {
      throw new NotFoundException('Không tìm thấy dữ liệu!');
    }
    const dto = new RoomDetailDto();
    dto.fromEntity(entity);

    return dto;
  }

  public async getRoomServices(id: string): Promise<RoomServiceDetailDto> {
    const entity = await this.roomsRepository.findOne({
      where: {
        id: id as any,
      },
      relations: ['property', 'property.services', 'property.services.service'],
    });

    if (!entity) {
      throw new NotFoundException('Không tìm thấy dữ liệu!');
    }
    const dto = new RoomServiceDetailDto();
    dto.fromEntity(entity);

    const contract = await this.contractsRepository.findOne({
      where: {
        roomId: entity.id,
      },
      relations: ['contractServices'],
      order: {
        endDate: 'DESC',
      },
    });

    if (
      contract &&
      contract.contractServices &&
      contract.contractServices.length > 0
    ) {
      dto.contractServices = contract.contractServices.map((service) => {
        const contractServiceDetailDto = new ContractServiceDetailDto();
        contractServiceDetailDto.fromEntity(service);
        return contractServiceDetailDto;
      });
    } else {
      if (
        entity.property &&
        entity.property.services &&
        entity.property.services.length > 0
      ) {
        const propertyServices = entity.property.services;
        dto.contractServices = propertyServices.map((service) => {
          const contractServiceDetailDto = new ContractServiceDetailDto();
          contractServiceDetailDto.fromPropertyService(service);
          return contractServiceDetailDto;
        });
      }
    }

    if (entity.property) {
      const property = new PropertyDetailDto();
      property.fromEntity(entity.property);
      dto.property = property;
    }

    return dto;
  }

  public getRoomsDefaultFromTotalNumberRooms(
    property: PropertyCreateDto,
  ): RoomCreateDto[] {
    const rooms: RoomCreateDto[] = [];
    const numberFloor = property.numberFloor;
    const totalRoom = property.totalRoom;
    if (numberFloor && numberFloor > 0) {
      // Trường hợp có số tầng
      const baseRoomPerFloor = Math.floor(totalRoom / numberFloor);
      let remainingRooms = totalRoom % numberFloor;

      let roomNumber = 1;

      for (let floor = 1; floor <= numberFloor; floor++) {
        // Nếu còn phòng thừa, tầng này sẽ có thêm 1 phòng
        let roomsOnThisFloor = baseRoomPerFloor + (remainingRooms > 0 ? 1 : 0);
        if (remainingRooms > 0) remainingRooms--;

        for (let i = 0; i < roomsOnThisFloor; i++) {
          const room = new RoomCreateDto();
          room.name = `Phòng ${roomNumber}`;
          room.floor = floor.toString();
          room.status = RoomStatus.AVAILABLE;
          room.rentAmount = property.defaultRoomRent;
          room.defaultDepositAmount = property.defaultRoomRent;
          room.defaultPaymentDueDay = property.paymentDate ?? 5;
          rooms.push(room);
          roomNumber++;
        }
      }
    } else {
      // Trường hợp không có số tầng, tất cả floor là null
      for (let i = 1; i <= totalRoom; i++) {
        const room = new RoomCreateDto();
        room.name = `Phòng ${i}`;
        room.status = RoomStatus.AVAILABLE;
        room.rentAmount = property.defaultRoomRent;
        room.defaultDepositAmount = property.defaultRoomRent;
        room.defaultPaymentDueDay = property.paymentDate ?? 5;
        rooms.push(room);
      }
    }
    return rooms;
  }
}
