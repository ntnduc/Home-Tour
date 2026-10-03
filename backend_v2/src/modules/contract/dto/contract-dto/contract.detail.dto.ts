import { PropertyDetailDto } from 'src/modules/property/dto/properties-dto/property.detail.dto';
import { RoomDetailDto } from 'src/modules/property/dto/room-dto/room.detail.dto';
import { BaseDetailDto } from '../../../../common/base/dto/detail.dto';
import { ContractStatus } from '../../../../common/enums/contract.enum';
import { Contracts } from '../../entities/contracts.entity';
import { ContractClientDetailDto } from '../contract-client-dto/contract-client.detail.dto';
import { ContractServiceDetailDto } from '../contract-services-dto/contract-service.detail.dto';

export class ContractDetailDto extends BaseDetailDto<Contracts> {
  propertyId: string;
  roomId: string;
  code: string;
  partnerClientCount?: number;
  isPrepaidRoom?: boolean;
  room?: RoomDetailDto;
  property?: PropertyDetailDto;
  startDate: Date;
  endDate?: Date;
  rentAmountAgreed: number;
  depositAmountPaid: number;
  paymentDueDay: number;
  contractScanURL?: string;
  status: ContractStatus;
  notes?: string;
  carryDebtToNextInvoice: boolean;
  contractClient?: ContractClientDetailDto[];
  contractServices?: ContractServiceDetailDto[];
  // ID của hóa đơn tạm thời được tạo ra khi hợp đồng được kích hoạt.
  preInvoiceId?: string;

  fromEntity(entity: Contracts): void {
    this.id = entity.id;
    this.code = entity.code;
    this.propertyId = entity.propertyId;
    this.roomId = entity.roomId;
    this.partnerClientCount = entity.partnerClientCount;
    this.isPrepaidRoom = entity.isPrepaidRoom;
    this.startDate = entity.startDate;
    this.endDate = entity.endDate;
    this.rentAmountAgreed = entity.rentAmountAgreed
      ? Number(entity.rentAmountAgreed)
      : 0;
    this.depositAmountPaid = entity.depositAmountPaid
      ? Number(entity.depositAmountPaid)
      : 0;
    this.paymentDueDay = entity.paymentDueDay;
    this.contractScanURL = entity.contractScanURL;
    this.status = entity.status;
    this.notes = entity.notes;
    this.carryDebtToNextInvoice = entity.carryDebtToNextInvoice ?? false;

    //Room
    if (entity.room) {
      this.room = new RoomDetailDto();
      this.room.fromEntity(entity.room);
    }

    //Property
    if (entity.property) {
      this.property = new PropertyDetailDto();
      this.property.fromEntity(entity.property);
    }

    //Contract Client
    if (entity.contractClient) {
      this.contractClient = entity.contractClient.map((lp) => {
        const contractClientDetailDto = new ContractClientDetailDto();
        contractClientDetailDto.fromEntity(lp);
        return contractClientDetailDto;
      });
    }

    //Contract Services
    this.contractServices =
      entity.contractServices?.map((ls) => {
        const contractServiceDetailDto = new ContractServiceDetailDto();
        contractServiceDetailDto.fromEntity(ls);
        return contractServiceDetailDto;
      }) || [];

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.createdBy = entity.createdBy;
    this.updatedBy = entity.updatedBy;
  }
}
