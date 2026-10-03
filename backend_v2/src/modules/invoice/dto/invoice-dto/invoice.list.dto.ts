import { BaseListDto } from '../../../../common/base/dto/list.dto';
import { InvoiceStatus } from '../../../../common/enums/invoice.enum';
import { Invoice } from '../../entities/invoice.entity';

export class InvoiceListDto extends BaseListDto<Invoice> {
  contractId: string;
  roomId: string;
  propertyId: string;
  roomName: string;
  propertyName: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt?: Date;

  fromEntity(entity: Invoice): void {
    this.id = entity.id;
    this.contractId = entity.contractId;
    this.roomId = entity.roomId;
    this.propertyId = entity.propertyId;
    this.roomName = entity.room?.name || '';
    this.propertyName = entity.property?.name || '';
    this.billingPeriodStart = entity.billingPeriodStart;
    this.billingPeriodEnd = entity.billingPeriodEnd;
    this.dueDate = entity.dueDate;
    this.totalAmount = entity.totalAmount ? Number(entity.totalAmount) : 0;
    this.paidAmount = entity.paidAmount ? Number(entity.paidAmount) : 0;
    this.remainingAmount = entity.remainingAmount
      ? Number(entity.remainingAmount)
      : 0;
    this.status = entity.status;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

