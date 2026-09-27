import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContextService } from 'src/common/base/context/request-context.service';
import { ContractStatus } from 'src/common/enums/contract.enum';
import { DataSource, EntityManager, In, SelectQueryBuilder } from 'typeorm';
import { BaseService } from '../../common/base/crud/base.service';
import { IBaseService } from '../../common/base/crud/IService';
import { RoomStatus } from '../../common/enums/room.enum';
import { AuthService } from '../auth/auth.service';
import { Client } from '../client/entities/client.entity';
import { ClientRepository } from '../client/repositories/client.repository';
import { InvoiceService } from '../invoice/invoice.service';
import { PropertiesServiceRepository } from '../property/repositories/properties-service.repository';
import { RoomsRepository } from '../property/repositories/rooms.repository';
import { ServicesRepository } from '../services/repositories/services.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { ContractClientCreateDto } from './dto/contract-client-dto/contract-client.create.dto';
import { ContractChangeStatusDto } from './dto/contract-dto/contract.change.status.dto';
import { ContractCreateDto } from './dto/contract-dto/contract.create.dto';
import { ContractDetailDto } from './dto/contract-dto/contract.detail.dto';
import { ContractListDto } from './dto/contract-dto/contract.list.dto';
import { ContractUpdateDto } from './dto/contract-dto/contract.update.dto';
import { ContractServiceCreateDto } from './dto/contract-services-dto/contract-service.create.dto';
import { ContractChangeDetail } from './entities/contract-change-detail.entity';
import { ContractChangeLog } from './entities/contract-change-log.entity';
import { ContractServices } from './entities/contract-services.entity';
import { Contracts } from './entities/contracts.entity';
import { ContractsRepository } from './repositories/contracts.repository';

@Injectable()
export class ContractService
  extends BaseService<
    Contracts,
    ContractDetailDto,
    ContractListDto,
    ContractCreateDto,
    ContractUpdateDto
  >
  implements
    IBaseService<
      Contracts,
      ContractDetailDto,
      ContractListDto,
      ContractCreateDto,
      ContractUpdateDto
    >
{
  constructor(
    private readonly contractsRepository: ContractsRepository,
    private readonly roomsRepository: RoomsRepository,
    private readonly propertiesServiceRepository: PropertiesServiceRepository,
    private readonly servicesRepository: ServicesRepository,
    private readonly userRepository: UserRepository,
    private readonly clientRepository: ClientRepository,
    private readonly dataSource: DataSource,

    private readonly invoiceService: InvoiceService,
  ) {
    super(
      contractsRepository,
      ContractDetailDto,
      ContractListDto,
      ContractCreateDto,
      ContractUpdateDto,
    );
  }
  // Định nghĩa các trường cần theo dõi thay đổi
  protected static FIELD_TRACKING_CHANGE = ['status'];

  async specQuery(): Promise<SelectQueryBuilder<Contracts>> {
    const query = this.contractsRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.room', 'room')
      .leftJoinAndSelect('contract.contractClient', 'contractClient')
      .leftJoinAndSelect('contractClient.client', 'client')
      .leftJoinAndSelect('contract.contractServices', 'contractServices');
    query.orderBy('contract.createdAt', 'DESC');
    return query;
  }

  async create(createDto: ContractCreateDto): Promise<ContractDetailDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const detailDto = new ContractDetailDto();

    try {
      // Kiểm tra phòng có tồn tại và trạng thái AVAILABLE
      const room = await this.roomsRepository.findOne({
        where: { id: createDto.roomId },
      });

      if (!room) {
        throw new NotFoundException('Phòng không tồn tại');
      }

      if (room.status !== RoomStatus.AVAILABLE) {
        throw new BadRequestException('Phòng đang không sẵn sàng để cho thuê!');
      }

      // TODO: Kiểm tra xem có hợp đồng ACTIVE nào khác cho phòng này không
      // Thiếu kiểm tra ngày bắt đầu và ngày kết thúc của hợp đồng hiện tại với các hợp đồng khác
      const activeContractExists = await this.contractsRepository.findOne({
        where: {
          roomId: createDto.roomId,
          status: ContractStatus.ACTIVE,
        },
      });

      if (activeContractExists) {
        throw new BadRequestException('Phòng đã có hợp đồng đang hoạt động');
      }

      if (!createDto.contractClient || createDto.contractClient.length === 0) {
        throw new BadRequestException('Phải có ít nhất 1 người thuê');
      }

      const contractEntity = createDto.getEntity();
      contractEntity.status = ContractStatus.DRAFT;

      // if (contractEntity.startDate <= getCurrentDate(true)) {
      //   contractEntity.status = ContractStatus.ACTIVE;
      // }
      const savedContract = await queryRunner.manager.save(
        Contracts,
        contractEntity,
      );

      await this.createContractClient(
        savedContract.id,
        createDto.contractClient,
        savedContract,
        queryRunner.manager,
      );

      if (createDto.contractServices && createDto.contractServices.length > 0) {
        await this.createContractServices(
          savedContract.id,
          createDto.contractServices,
          savedContract,
          queryRunner.manager,
        );
      }

      if (savedContract.status === ContractStatus.ACTIVE) {
        await queryRunner.manager.update(
          'rooms',
          { id: createDto.roomId },
          { status: RoomStatus.PENDING_DEPOSIT },
        );
      }

      // Tạo hóa đơn nếu hợp đồng là hợp đồng trả trước và đã thanh toán tiền cọc
      const invoiceCreateDto =
        this.invoiceService.getPreInvoiceContract(savedContract);
      if (invoiceCreateDto) {
        const invoice = invoiceCreateDto.getEntity();
        const newInvoice = await queryRunner.manager.save(invoice);
        detailDto.preInvoiceId = newInvoice.id; // Gán preInvoiceId vào detailDto
        invoice.invoiceItems.forEach((item) => {
          item.invoiceId = newInvoice.id;
        });
        await queryRunner.manager.save(invoice.invoiceItems);
      }

      await queryRunner.commitTransaction();

      const detailContract = await this.contractsRepository.findOne({
        where: { id: savedContract.id },
        relations: [
          'contractServices',
          'contractClient',
          'contractClient.client',
        ],
      });

      detailDto.fromEntity(detailContract!);
      return detailDto;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(updateDto: ContractUpdateDto): Promise<ContractDetailDto> {
    throw new BadRequestException('Not implemented');
  }

  async active(updateDto: ContractChangeStatusDto): Promise<ContractDetailDto> {
    const id = updateDto.id;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingContract = await this.contractsRepository.findOne({
        where: { id },
        relations: ['room'],
      });

      if (!existingContract) {
        throw new NotFoundException('Hợp đồng không tồn tại');
      }

      await this.handleStatusChange(
        existingContract,
        updateDto.status,
        updateDto.reason,
        queryRunner.manager,
      );

      const otherActiveContracts = await this.contractsRepository
        .createQueryBuilder('contract')
        .where('contract.roomId = :roomId', { roomId: existingContract.roomId })
        .andWhere('contract.id != :currentContractId', {
          currentContractId: existingContract.id,
        })
        .andWhere('contract.status = :status', {
          status: ContractStatus.ACTIVE,
        })
        .getCount();

      if (otherActiveContracts === 0) {
        await queryRunner.manager.update(
          'rooms',
          { id: existingContract.roomId },
          { status: RoomStatus.OCCUPIED },
        );
      } else {
        throw new BadRequestException(
          'Không thể kích hoạt hợp đồng vì đã có hợp đồng đang hoạt động cho phòng này',
        );
      }

      await queryRunner.commitTransaction();

      // Lấy thông tin chi tiết hợp đồng sau khi cập nhật
      const detailContract = await this.contractsRepository.findOne({
        where: { id },
        relations: [
          'contractServices',
          'contractServices.propertyService',
          'contractServices.propertyService.service',
        ],
      });
      const detailDto = new ContractDetailDto();
      detailDto.fromEntity(detailContract!);
      return detailDto;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deActive(
    fork: boolean,
    updateDto: ContractChangeStatusDto,
  ): Promise<ContractDetailDto> {
    if (!fork) {
      throw new BadRequestException('Not implemented');
    }
    if (updateDto.reason === undefined || updateDto.reason.trim() === '') {
      throw new BadRequestException('Lý do hủy hợp đồng không được để trống');
    }
    const contract = await this.contractsRepository.findOne({
      where: { id: updateDto.id, status: ContractStatus.ACTIVE },
    });
    if (contract === null) {
      throw new NotFoundException('Hợp đồng không tồn tại');
    }
    const allowContractUpdate = [
      ContractStatus.TERMINATED_EARLY,
      ContractStatus.EXPIRED,
      ContractStatus.ENDED,
    ];
    if (allowContractUpdate.indexOf(updateDto.status) === -1) {
      throw new BadRequestException('Trạng thái hợp đồng không hợp lệ');
    }
    const newEntity = this.handleStatusChange(
      contract,
      updateDto.status,
      updateDto.reason,
      this.dataSource.manager,
    );
    const dto = new ContractDetailDto();
    dto.fromEntity(await newEntity);
    return dto;
  }

  async get(id: string): Promise<ContractDetailDto> {
    const contract = await this.contractsRepository.findOne({
      where: { id },
      relations: [
        'contractServices',
        'contractClient',
        'contractClient.client',
        'room',
      ],
    });
    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại');
    }
    const detailDto = new ContractDetailDto();
    detailDto.fromEntity(contract);
    return detailDto;
  }

  async getContractForInvoice(id: string): Promise<ContractDetailDto> {
    const contract = await this.contractsRepository.findOne({
      where: { id },
      relations: [
        'contractServices',
        'contractClient',
        'contractClient.client',
        'room',
        'room.property',
      ],
    });
    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại');
    }
    const detailDto = new ContractDetailDto();
    detailDto.fromEntity(contract);
    return detailDto;
  }

  //#region Support functions

  private async createContractServices(
    contractId: string,
    contractServicesDto: ContractServiceCreateDto[],
    contract: Contracts,
    manager: EntityManager,
  ): Promise<void> {
    const contractServiceCreateEntities = contractServicesDto.map((x) =>
      x.getEntity(),
    );
    contractServiceCreateEntities.forEach((x) => {
      x.contractId = contractId;
    });
    await manager.save(ContractServices, contractServiceCreateEntities);
  }

  private async createContractClient(
    contractId: string,
    contractClientsDto: ContractClientCreateDto[],
    contract: Contracts,
    manager: EntityManager,
  ): Promise<void> {
    const findPrimaryClient = contractClientsDto.find(
      (client) => client.isLandlordClient,
    );

    if (!findPrimaryClient) {
      throw new BadRequestException('Phải có ít nhất 1 người thuê chính');
    }

    contractClientsDto.forEach((property) => {
      if (property.isLandlordClient) {
        property.phoneNumber = AuthService.formatPhoneNumber(
          property.phoneNumber,
        );
      }
    });

    const phones = contractClientsDto.map((x) => x.phoneNumber);

    const existedClients = await this.clientRepository.find({
      where: { phoneNumber: In(phones) },
    });

    for (const propertyDto of contractClientsDto) {
      const existed = existedClients.find(
        (x) => x.phoneNumber === propertyDto.phoneNumber,
      );

      if (existed) {
        propertyDto.clientId = existed.id;
      } else {
        const client = new Client();
        client.phoneNumber = propertyDto.phoneNumber;
        client.fullName = propertyDto.name;
        client.isActive = true;
        await manager.save(client);
        propertyDto.clientId = client.id;
      }
      propertyDto.contractId = contractId;
      const clientCreateDto = new ContractClientCreateDto();
      clientCreateDto.name = propertyDto.name;
      clientCreateDto.isLandlordClient = propertyDto.isLandlordClient;
      clientCreateDto.moveInDate = propertyDto.moveInDate;
      clientCreateDto.moveOutDate = propertyDto.moveOutDate;
      clientCreateDto.isActiveInContract = propertyDto.isActiveInContract;
      clientCreateDto.contractId = contractId;
      clientCreateDto.clientId = propertyDto.clientId;

      const clientEntity = clientCreateDto.getEntity();
      await manager.save(clientEntity);
    }
  }

  private async handleStatusChange(
    contract: Contracts,
    newStatus: ContractStatus,
    reason: string,
    manager: EntityManager,
  ): Promise<Contracts> {
    await manager.update(Contracts, contract.id, { status: newStatus });
    // const newContract = await manager.findOne(Contracts, {
    //   where: { id: contract.id },
    // });

    const newContract = await manager.update(Contracts, contract.id, {
      status: newStatus,
    });

    await this.recordChange(
      newContract.raw,
      contract,
      'STATUS_CHANGE',
      reason,
      manager,
    );
    return newContract.raw;
  }

  private async recordChange(
    contract: Contracts,
    oldContract: Contracts,
    type: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'TERMINATE' | 'EXTEND',
    reason: string,
    manager: EntityManager,
  ): Promise<void> {
    const user = RequestContextService.getUserObj();
    const userRoleCurretProperty = user?.properties?.find(
      (property: any) => property.propertyId === contract.propertyId,
    );

    const changeLog = new ContractChangeLog();
    if (userRoleCurretProperty) {
      changeLog.actorRole = userRoleCurretProperty.role;
    }
    changeLog.propertyId = contract.propertyId;
    changeLog.contractId = contract.id;
    changeLog.changeType = type;
    changeLog.changeReason = reason;
    changeLog.metadata = {};
    const changeDetails = this.getChangeDetails(oldContract, contract);
    changeLog.contractChangeDetails = changeDetails;
    await manager.save(changeLog);
  }

  private getChangeDetails(
    oldContract: Contracts,
    newContract: Contracts,
  ): ContractChangeDetail[] {
    const changeDetails: ContractChangeDetail[] = [];
    const fields = ContractService.FIELD_TRACKING_CHANGE;
    for (const field of fields) {
      if (oldContract[field] !== newContract[field]) {
        const changeDetail = new ContractChangeDetail();
        changeDetail.contractId = oldContract.id;
        changeDetail.field = field;
        changeDetail.oldValue = oldContract[field];
        changeDetail.newValue = newContract[field] ?? null;
        changeDetails.push(changeDetail);
        changeDetail.propertyId = oldContract.propertyId;
      }
    }
    return changeDetails;
  }
  //#endregion
}
