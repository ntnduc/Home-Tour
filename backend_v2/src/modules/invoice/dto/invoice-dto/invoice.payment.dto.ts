import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BaseUpdateDto } from 'src/common/base/dto/update.dto';
import { Invoice } from '../../entities/invoice.entity';

export class InvoicePaymentDto extends BaseUpdateDto<Invoice> {
  @IsNumber()
  @Min(0)
  paidAmount: number;

  // tiền cần thanh toán hiển thị trên UI, có thể khác với remainingAmount trong DB nếu có nhiều lần thanh toán
  @IsNumber()
  @Min(0, { message: 'Số tiền thanh toán phải lớn hơn 0' })
  remainingAmount: number;

  /** ghi nợ vào cho hóa đơn tiếp theo
   * true: ghi nợ vào cho hóa đơn tiếp theo
   * false: không ghi nợ vào cho hóa đơn tiếp theo
   */
  @IsOptional()
  @IsBoolean()
  isCarryOver?: boolean;

  // @IsDateString()
  // dueDate: string;

  // @IsString()
  // @IsNotEmpty({ message: 'Không có mã hợp đồng' })
  // contractId: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  paymentMethod: string;

  // Amounts and status are calculated in calculateInvoicePayment (invoice-payment.util.ts);
  // the client-sent remainingAmount is only informational.
  getEntity(entity: Invoice): Invoice {
    return entity;
  }
}
