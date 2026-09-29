import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseUpdateDto } from '../../../../common/base/dto/update.dto';
import { Invoice } from '../../entities/invoice.entity';

export class InvoiceUpdateDto implements BaseUpdateDto<Invoice> {
  @IsString()
  id: string;

  @IsOptional()
  @IsDateString()
  billingPeriodStart?: string;

  @IsOptional()
  @IsDateString()
  billingPeriodEnd?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  remainingAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  getEntity(entity: Invoice): QueryDeepPartialEntity<Invoice> {
    const updateData: QueryDeepPartialEntity<Invoice> = { ...entity };

    if (this.billingPeriodStart)
      updateData.billingPeriodStart = new Date(this.billingPeriodStart);
    if (this.billingPeriodEnd)
      updateData.billingPeriodEnd = new Date(this.billingPeriodEnd);
    if (this.dueDate) updateData.dueDate = new Date(this.dueDate);
    if (this.totalAmount !== undefined)
      updateData.totalAmount = this.totalAmount;
    if (this.paidAmount !== undefined) updateData.paidAmount = this.paidAmount;
    if (this.remainingAmount !== undefined)
      updateData.remainingAmount = this.remainingAmount;
    if (this.notes !== undefined) updateData.notes = this.notes;

    return updateData;
  }
}
