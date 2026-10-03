import { BaseListDto } from '../../../../common/base/dto/list.dto';
import { PaymentStatus, PaymentType } from '../../../../common/enums/payment.enum';
import { Payment } from '../../entities/payment.entity';

export class PaymentListDto extends BaseListDto<Payment> {
  invoiceId: string;
  paymentDate: Date;
  amount: number;
  propertyId: string;
  propertyName: string;
  type: PaymentType;
  paymentMethod?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt?: Date;

  fromEntity(entity: Payment): void {
    this.id = entity.id;
    this.invoiceId = entity.invoiceId;
    this.paymentDate = entity.paymentDate;
    this.amount = entity.amount ? Number(entity.amount) : 0;
    this.propertyId = entity.propertyId;
    this.propertyName = entity.property?.name || '';
    this.type = entity.type;
    this.paymentMethod = entity.paymentMethod;
    this.status = entity.status;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

