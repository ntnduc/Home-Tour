import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ServiceCalculationMethod } from 'src/common/enums/service.enum';
import { BaseCreateDto } from '../../../../common/base/dto/create.dto';
import { InvoiceItemType } from '../../../../common/enums/invoice.enum';
import { InvoiceItem } from '../../entities/invoice.item.entity';

export class InvoiceItemCreateDto extends BaseCreateDto<InvoiceItem> {
  @IsUUID()
  invoiceId: string;

  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(InvoiceItemType)
  type: InvoiceItemType;

  @IsNumber()
  @IsOptional()
  helperValue?: number;

  @IsNumber()
  @IsOptional()
  oldHelperValue?: number;

  @IsUUID()
  @IsOptional()
  contractServiceId?: string;

  @IsUUID()
  propertyId: string;

  @IsOptional()
  @IsEnum(ServiceCalculationMethod)
  calculationMethod?: ServiceCalculationMethod;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  getEntity(): InvoiceItem {
    const entity = new InvoiceItem();
    entity.name = this.name;
    entity.invoiceId = this.invoiceId;
    entity.amount = this.amount;
    entity.type = this.type;
    entity.helperValue = this.helperValue;
    entity.oldHelperValue = this.oldHelperValue;
    entity.contractServiceId = this.contractServiceId;
    entity.propertyId = this.propertyId;
    entity.metadata = this.metadata ?? {};
    entity.calculationMethod = this.calculationMethod;
    return entity;
  }

  deptClone(): InvoiceItemCreateDto {
    const clone = new InvoiceItemCreateDto();
    clone.name = this.name;
    clone.invoiceId = this.invoiceId;
    clone.amount = this.amount;
    clone.type = this.type;
    clone.helperValue = this.helperValue;
    clone.oldHelperValue = this.oldHelperValue;
    clone.contractServiceId = this.contractServiceId;
    clone.propertyId = this.propertyId;
    clone.metadata = { ...this.metadata };
    clone.calculationMethod = this.calculationMethod;
    return clone;
  }
}
