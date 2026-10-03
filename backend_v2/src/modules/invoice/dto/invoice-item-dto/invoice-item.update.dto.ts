import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseUpdateDto } from '../../../../common/base/dto/update.dto';
import { InvoiceItemType } from '../../../../common/enums/invoice.enum';
import { InvoiceItem } from '../../entities/invoice.item.entity';

export class InvoiceItemUpdateDto implements BaseUpdateDto<InvoiceItem> {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  id: string;

  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(InvoiceItemType)
  type?: InvoiceItemType;

  @IsOptional()
  @IsNumber()
  helperValue?: number;

  @IsOptional()
  @IsUUID()
  contractServiceId?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  getEntity(entity: InvoiceItem): QueryDeepPartialEntity<InvoiceItem> {
    const updateData: QueryDeepPartialEntity<InvoiceItem> = { ...entity };

    if (this.invoiceId) updateData.invoiceId = this.invoiceId;
    if (this.amount !== undefined) updateData.amount = this.amount;
    if (this.type) updateData.type = this.type;
    if (this.helperValue !== undefined)
      updateData.helperValue = this.helperValue;
    if (this.contractServiceId !== undefined)
      updateData.contractServiceId = this.contractServiceId;
    if (this.metadata !== undefined) updateData.metadata = this.metadata;

    return updateData;
  }
}
