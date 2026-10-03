import { BaseListDto } from '../../../../common/base/dto/list.dto';
import { ContractStatus } from '../../../../common/enums/contract.enum';
import { Contracts } from '../../entities/contracts.entity';
import { ContractClientListDto } from '../contract-client-dto/contract-client.list.dto';

export class ContractListDto extends BaseListDto<Contracts> {
  code: string;
  propertyId: string;
  roomId: string;
  roomName: string;
  propertyName: string;
  client?: ContractClientListDto[];
  landlordName: string;
  startDate: Date;
  endDate?: Date;
  rentAmountAgreed: number;
  depositAmountPaid: number;
  paymentDueDay: number;
  status: ContractStatus;
  totalProperties: number;
  createdAt: Date;
  updatedAt?: Date;
  isPrepaidRoom?: boolean;
  fromEntity(entity: Contracts): void {
    this.id = entity.id;
    this.propertyId = entity.propertyId;
    this.roomId = entity.roomId;
    this.roomName = entity.room?.name || '';
    this.propertyName = entity?.property?.name || '';
    this.startDate = entity.startDate;
    this.endDate = entity.endDate;
    this.rentAmountAgreed = entity.rentAmountAgreed;
    this.depositAmountPaid = entity.depositAmountPaid;
    this.paymentDueDay = entity.paymentDueDay;
    this.status = entity.status;
    this.totalProperties =
      entity.contractClient?.filter((p) => p.isActiveInContract).length || 0;
    this.client = entity.contractClient && entity.contractClient?.map(item => {
      const dto = new ContractClientListDto();
      dto.fromEntity(item);
      return dto;
    });
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.code = entity.code;
    this.isPrepaidRoom = entity.isPrepaidRoom;
  }
}
