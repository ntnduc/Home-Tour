import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base/crud/base.service';
import { IBaseService } from 'src/common/base/crud/IService';
import { ComboOptionWithExtra } from 'src/common/base/dto/option.dto';
import { Role } from 'src/common/enums/role.enum';
import { PropertyRoomsStatus } from 'src/common/enums/property.enum';
import { RoomStatus } from 'src/common/enums/room.enum';
import { DataSource, In, Repository, SelectQueryBuilder } from 'typeorm';
import { CurrentUserService } from '../current.user';
import { Districts } from '../location/entities/Districts.entity';
import { Provinces } from '../location/entities/Provinces.entity';
import { Wards } from '../location/entities/Wards.entity';
import { RoleEntity } from '../rbac/entities/role.entity';
import { UserRole } from '../rbac/entities/user-role.entity';
import { ServicesRepository } from '../services/repositories/services.repository';
import { PropertyCreateDto } from './dto/properties-dto/property.create.dto';
import { PropertyDetailDto } from './dto/properties-dto/property.detail.dto';
import { PropertyListDto } from './dto/properties-dto/property.list.dto';
import { PropertyUpdateDto } from './dto/properties-dto/property.update.dto';
import { PropertyServiceDetailDto } from './dto/properties-service-dto/properties-service.detail.dto';
import { Properties } from './entities/properties.entity';
import { Rooms } from './entities/rooms.entity';
import { PropertiesServiceService } from './properties-service.service';
import { PropertiesServiceRepository } from './repositories/properties-service.repository';
import { PropertiesRepository } from './repositories/properties.repository';
import { RoomsRepository } from './repositories/rooms.repository';
import { RoomsService } from './rooms.service';

@Injectable()
export class PropertyService
  extends BaseService<
    Properties,
    PropertyDetailDto,
    PropertyListDto,
    PropertyCreateDto,
    PropertyUpdateDto
  >
  implements
  IBaseService<
    Properties,
    PropertyDetailDto,
    PropertyListDto,
    PropertyCreateDto,
    PropertyUpdateDto
  > {
  constructor(
    private propertiesRepository: PropertiesRepository,
    private servicesRepository: ServicesRepository,
    private roomsRepository: RoomsRepository,
    private propertiesServicesRepository: PropertiesServiceRepository,

    @InjectRepository(Provinces)
    private provincesRepository: Repository<Provinces>,
    @InjectRepository(Districts)
    private districtsRepository: Repository<Districts>,
    @InjectRepository(Wards)
    private wardsRepository: Repository<Wards>,

    //#region Inject services
    private readonly dataSource: DataSource,
    private readonly roomService: RoomsService,
    private readonly currentUserService: CurrentUserService,
    private readonly propertiesServicesService: PropertiesServiceService,
    //#endregion
  ) {
    super(
      propertiesRepository,
      PropertyDetailDto,
      PropertyListDto,
      PropertyCreateDto,
      PropertyUpdateDto,
    );
  }

  async getComboProperty() {
    this.currentUserService.getCurrentUserId();
    // globalQuery scopes to properties the user owns or is a member of
    const properties = await this.propertiesRepository
      .createQueryBuilder('p')
      .getMany();

    const result = properties.map((property) => {
      const comboOption = new ComboOptionWithExtra<
        string,
        string,
        PropertyDetailDto
      >();
      const dto = new PropertyDetailDto();
      dto.fromEntity(property);
      comboOption.label = property.name ?? '';
      comboOption.value = property.id;
      comboOption.extra = dto;
      return comboOption;
    });

    return result;
  }

  override async create(propertyCreateDto: PropertyCreateDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const propertyEntity = propertyCreateDto.getEntity();
      const currentUserId = this.currentUserService.getCurrentUserId();
      propertyEntity.ownerId = currentUserId;

      const propertySaved = await queryRunner.manager.save(
        Properties,
        propertyEntity,
      );

      // Creator always becomes OWNER of the new property (per-property role)
      const ownerRole = await queryRunner.manager.findOne(RoleEntity, {
        where: { roleName: Role.OWNER },
      });
      if (!ownerRole) {
        throw new Error('Owner role is not initialized');
      }
      await queryRunner.manager.save(UserRole, {
        userId: currentUserId,
        roleId: ownerRole.id,
        propertyId: propertySaved.id,
        assignedDate: new Date(),
      });

      if (propertyCreateDto.services && propertyCreateDto.services.length > 0) {
        await this.propertiesServicesService.createOrUpdate(
          propertyCreateDto.services,
          propertySaved.id,
          [],
          queryRunner.manager,
        );
      }

      const rooms =
        this.roomService.getRoomsDefaultFromTotalNumberRooms(propertyCreateDto);
      if (rooms && rooms.length > 0) {
        rooms.forEach((room) => (room.propertyId = propertySaved.id));
        const newRooms = this.roomsRepository.create(rooms);
        await queryRunner.manager.save(newRooms);
      }

      await queryRunner.commitTransaction();
      const result = new PropertyDetailDto();
      result.fromEntity(propertySaved);
      return result;
    } catch (err) {
      console.error('Create property error:', err);
      await queryRunner.rollbackTransaction();
      throw new BadGatewayException('Lỗi khi tạo property!');
    } finally {
      await queryRunner.release();
    }
  }

  override async update(dto: PropertyUpdateDto): Promise<PropertyDetailDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const property = await queryRunner.manager.findOne(Properties, {
        where: { id: dto.id },
        relations: ['services', 'services.service'],
      });
      if (!property) throw new NotFoundException('Property not found');

      await this.propertiesServicesService.createOrUpdate(
        dto.services || [],
        property.id,
        dto.removeServiceIds,
        queryRunner.manager,
      );

      const updatedEntity = dto.getEntity(property);
      const cloneUpdatedEntity = Object.assign({}, updatedEntity);
      if (cloneUpdatedEntity.services) {
        cloneUpdatedEntity.services = undefined;
      }
      await queryRunner.manager.update(
        Properties,
        property.id,
        cloneUpdatedEntity,
      );

      await queryRunner.commitTransaction();
      const result = await this.get(property.id);
      return result;
    } catch (err) {
      console.error('Update property error:', err);
      await queryRunner.rollbackTransaction();
      throw new BadGatewayException('Lỗi khi cập nhật căn hộ!');
    } finally {
      await queryRunner.release();
    }
  }

  override async get(id: string): Promise<PropertyDetailDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['services', 'services.service'],
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const result = new PropertyDetailDto();

    const services = property.services.map((service) => {
      const serviceDto = new PropertyServiceDetailDto();
      serviceDto.fromEntity(service);
      return serviceDto;
    });
    result.services = services;
    result.fromEntity(property);

    return result;
  }

  override async specQuery(): Promise<SelectQueryBuilder<Properties>> {
    const query = this.propertiesRepository.createQueryBuilder('entity');

    query.leftJoinAndSelect('entity.rooms', 'rooms');
    query.leftJoinAndSelect('entity.services', 'services');
    return query;
  }

  override async beautifyResult(
    items: Properties[],
  ): Promise<PropertyListDto[]> {
    const provinceCodes = items.map((item) => item.provinceCode);
    const districtCodes = items.map((item) => item.districtCode);
    const wardCodes = items.map((item) => item.wardCode);

    let provinces: Provinces[] = [];
    let districts: Districts[] = [];
    let wards: Wards[] = [];

    if (provinceCodes.length > 0) {
      provinces = await this.provincesRepository.find({
        where: { code: In(provinceCodes) },
      });
    }

    if (districtCodes.length > 0) {
      districts = await this.districtsRepository.find({
        where: { code: In(districtCodes) },
      });
    }

    if (wardCodes.length > 0) {
      wards = await this.wardsRepository.find({
        where: { code: In(wardCodes) },
      });
    }

    const result = items.map((item) => {
      const listDto = new PropertyListDto();
      listDto.fromEntity(item);
      listDto.statusRooms = this.statusRooms(item.rooms);

      const province = provinces.find(
        (province) => province.code === item.provinceCode,
      )?.full_name;
      const district = districts.find(
        (district) => district.code === item.districtCode,
      )?.full_name;
      const ward = wards.find((ward) => ward.code === item.wardCode)?.full_name;

      const address = `${item.address} - ${ward} - ${district} - ${province}`;
      listDto.address = address;

      return listDto;
    });
    return result;
  }

  //#region support function

  private statusRooms(rooms: Rooms[]): PropertyRoomsStatus {
    if (rooms.length === 0) return PropertyRoomsStatus.EMPTY;
    const countRoomsOccupied = rooms.filter(
      (room) => room.status === RoomStatus.OCCUPIED,
    ).length;

    return countRoomsOccupied === rooms.length
      ? PropertyRoomsStatus.FULL
      : PropertyRoomsStatus.PARTIAL;
  }

  //#endregion
}
