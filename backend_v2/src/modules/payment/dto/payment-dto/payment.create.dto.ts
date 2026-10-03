import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { getCurrentDate } from 'src/common/utils';
import { BaseCreateDto } from '../../../../common/base/dto/create.dto';
import {
  PaymentStatus,
  PaymentType,
} from '../../../../common/enums/payment.enum';
import { Payment } from '../../entities/payment.entity';

export class PaymentCreateDto extends BaseCreateDto<Payment> {
  // Hóa đơn cần thanh toán.
  @IsUUID()
  invoiceId: string;

  // Số tiền khách thanh toán, phải lớn hơn 0 (BR-004).
  @IsNumber()
  @IsPositive()
  amount: number;

  // Ngày thanh toán, mặc định là thời điểm hiện tại nếu không truyền.
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  // propertyId không bắt buộc từ client, service sẽ tự suy ra từ invoice để tránh sai lệch dữ liệu.
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsEnum(PaymentType)
  @IsOptional()
  type?: PaymentType;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  getEntity(): Payment {
    const entity = new Payment();
    entity.invoiceId = this.invoiceId;
    entity.paymentDate = this.paymentDate
      ? new Date(this.paymentDate)
      : getCurrentDate();
    entity.amount = this.amount;
    entity.propertyId = this.propertyId as any;
    entity.type = this.type ?? PaymentType.IN;
    entity.paymentMethod = this.paymentMethod ?? 'CASH';
    entity.status = PaymentStatus.PAID;
    entity.notes = this.notes;
    return entity;
  }
}
