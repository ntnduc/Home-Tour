import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseCreateDto } from '../../../../common/base/dto/create.dto';
import { InvoiceStatus } from '../../../../common/enums/invoice.enum';
import { Invoice } from '../../entities/invoice.entity';
import { InvoiceItemCreateDto } from '../invoice-item-dto/invoice-item.create.dto';

export class InvoiceCreateDto extends BaseCreateDto<Invoice> {
  @IsUUID()
  contractId: string;

  @IsUUID()
  roomId: string;

  @IsUUID()
  propertyId: string;

  @IsDateString()
  billingPeriodStart: string;

  @IsDateString()
  billingPeriodEnd: string;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  remainingAmount?: number;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isPassPreInvoice?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemCreateDto)
  invoiceItems?: InvoiceItemCreateDto[];

  getEntity(): Invoice {
    const entity = new Invoice();
    entity.contractId = this.contractId;
    entity.roomId = this.roomId;
    entity.propertyId = this.propertyId;
    entity.billingPeriodStart = new Date(this.billingPeriodStart);
    entity.billingPeriodEnd = new Date(this.billingPeriodEnd);
    entity.dueDate = new Date(this.dueDate);
    entity.paidAmount = this.paidAmount ?? 0;
    entity.remainingAmount =
      this.remainingAmount ?? this.totalAmount - entity.paidAmount;
    entity.status = this.status ?? InvoiceStatus.DRAFT;
    entity.notes = this.notes;
    entity.invoiceItems =
      this.invoiceItems?.map((item) => item.getEntity()) ?? [];
    entity.totalAmount = entity.calculatorTotalAmount();
    return entity;
  }

  compareToEntity(entity: Invoice): string | null {
    return null;
  }
}
