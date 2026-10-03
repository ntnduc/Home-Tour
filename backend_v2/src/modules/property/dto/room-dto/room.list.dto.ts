import { BaseListDto } from 'src/common/base/dto/list.dto';
import { ContractStatus } from 'src/common/enums/contract.enum';
import { ContractListDto } from 'src/modules/contract/dto/contract-dto/contract.list.dto';
import { InvoiceListDto } from 'src/modules/invoice/dto/invoice-dto/invoice.list.dto';
import { Rooms } from '../../entities/rooms.entity';
import { PropertyDetailDto } from '../properties-dto/property.detail.dto';
import { RoomActionDto } from './room-action.dto';

export class RoomListDto extends BaseListDto<Rooms> {
  propertyId: string;
  name: string;
  status: string;
  area?: number;
  rentAmount: number;
  maxOccupancy?: number;
  floor?: string;
  defaultDepositAmount: number;
  defaultPaymentDueDay: number;
  description?: string;
  property?: PropertyDetailDto;
  contracts?: ContractListDto[];
  landlordClient: string;
  invoices?: InvoiceListDto[];
  actions: RoomActionDto[] = [];
  pendingTaskCount: number = 0;
  hasOverdueAlert: boolean = false;
  overdueAlertMessage?: string;

  fromEntity(entity: Rooms): void {
    this.id = entity.id;
    this.propertyId = entity.propertyId;
    this.name = entity.name;
    this.status = entity.status;
    this.area = entity.area;
    this.rentAmount = entity.rentAmount;
    this.maxOccupancy = entity.maxOccupancy;
    this.floor = entity.floor;
    this.defaultDepositAmount = entity.defaultDepositAmount;
    this.defaultPaymentDueDay = entity.defaultPaymentDueDay;
    this.description = entity.description;

    if (entity.invoices && entity.invoices.length > 0) {
      this.invoices = entity.invoices.map((invoice) => {
        const invoiceDto = new InvoiceListDto();
        invoiceDto.fromEntity(invoice);
        return invoiceDto;
      });
    }

    if (entity.contracts && entity.contracts.length > 0) {
      this.contracts = entity.contracts.map((contract) => {
        const contractDto = new ContractListDto();
        contractDto.fromEntity(contract);
        return contractDto;
      });
      const contractActive = entity.contracts.find(
        (contract) =>
          contract.status === ContractStatus.ACTIVE &&
          contract.contractClient?.length > 0,
      );
      if (contractActive) {
        this.landlordClient =
          contractActive.contractClient.find(
            (contractClient) => contractClient.isLandlordClient,
          )?.name || '';
      }
    }

    if (entity.property) {
      const propertyDto = new PropertyDetailDto();
      propertyDto.fromEntity(entity.property);
      this.property = propertyDto;
    }
  }
}
