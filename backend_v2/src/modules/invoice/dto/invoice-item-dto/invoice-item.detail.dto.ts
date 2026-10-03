import { ContractServiceDetailDto } from 'src/modules/contract/dto/contract-services-dto/contract-service.detail.dto';
import { PropertyDetailDto } from 'src/modules/property/dto/properties-dto/property.detail.dto';
import { BaseDetailDto } from '../../../../common/base/dto/detail.dto';
import { InvoiceItemType } from '../../../../common/enums/invoice.enum';
import { InvoiceItem } from '../../entities/invoice.item.entity';

export class InvoiceItemDetailDto extends BaseDetailDto<InvoiceItem> {
  invoiceId: string;
  amount: number;
  name?: string;
  totalAmount: number;
  type: InvoiceItemType;
  helperValue?: number;
  contractServiceId?: string;
  metadata?: Record<string, any>;
  contractService?: ContractServiceDetailDto;
  property: PropertyDetailDto;
  fromEntity(entity: InvoiceItem): void {
    this.id = entity.id;
    this.name = entity.name;
    this.invoiceId = entity.invoiceId;
    this.amount = entity.amount ? Number(entity.amount) : 0;
    this.totalAmount = entity.amount ? Number(entity.amount) : 0;
    this.type = entity.type;
    this.helperValue = entity.helperValue;
    this.metadata = entity.metadata;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.createdBy = entity.createdBy;
    this.updatedBy = entity.updatedBy;

    if (entity.property) {
      this.property = new PropertyDetailDto();
      this.property.fromEntity(entity.property);
    }

    if (entity.contractService) {
      this.contractService = new ContractServiceDetailDto();
      this.contractService.fromEntity(entity.contractService);
    }
  }
}
