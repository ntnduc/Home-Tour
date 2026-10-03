import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { BaseService } from '../../common/base/crud/base.service';
import { IBaseService } from '../../common/base/crud/IService';
import { InvoiceStatus } from '../../common/enums/invoice.enum';
import { Invoice } from '../invoice/entities/invoice.entity';
import { PaymentCreateDto } from './dto/payment-dto/payment.create.dto';
import { PaymentDetailDto } from './dto/payment-dto/payment.detail.dto';
import { PaymentListDto } from './dto/payment-dto/payment.list.dto';
import { PaymentUpdateDto } from './dto/payment-dto/payment.update.dto';
import { Payment } from './entities/payment.entity';

/**
 * Xác định lại trạng thái hóa đơn dựa trên số tiền đã thu và hạn thanh toán.
 * Thứ tự kiểm tra: PAID -> PARTIALLY_PAID -> (PENDING | OVERDUE theo dueDate).
 * Tách thành hàm thuần (pure function) để dễ unit test độc lập.
 */
export function resolveInvoiceStatus(params: {
  paidAmount: number;
  remainingAmount: number;
  dueDate: Date;
  now?: Date;
}): InvoiceStatus {
  const { paidAmount, remainingAmount, dueDate, now = new Date() } = params;

  // BR-008: Thanh toán đủ
  if (remainingAmount <= 0) {
    return InvoiceStatus.PAID;
  }

  // BR-009: Thanh toán một phần
  if (paidAmount > 0) {
    return InvoiceStatus.PARTIALLY_PAID;
  }

  // BR-010: Chưa thanh toán gì - kiểm tra hạn thanh toán
  const endOfDueDate = new Date(dueDate);
  endOfDueDate.setHours(23, 59, 59, 999);

  return now.getTime() > endOfDueDate.getTime()
    ? InvoiceStatus.OVERDUE
    : InvoiceStatus.PENDING;
}

@Injectable()
export class PaymentService
  extends BaseService<
    Payment,
    PaymentDetailDto,
    PaymentListDto,
    PaymentCreateDto,
    PaymentUpdateDto
  >
  implements
    IBaseService<
      Payment,
      PaymentDetailDto,
      PaymentListDto,
      PaymentCreateDto,
      PaymentUpdateDto
    >
{
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly dataSource: DataSource,
  ) {
    super(
      paymentRepository as any,
      PaymentDetailDto,
      PaymentListDto,
      PaymentCreateDto,
      PaymentUpdateDto,
    );
  }

  async specQuery(): Promise<SelectQueryBuilder<Payment>> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('payment.property', 'property');

    return query;
  }

  async update(_dto: PaymentUpdateDto): Promise<PaymentDetailDto> {
    throw new BadRequestException(
      'Payment đã tạo không thể chỉnh sửa. Vui lòng tạo một bút toán điều chỉnh khác nếu cần.',
    );
  }

  async delete(_id: string): Promise<void> {
    throw new BadRequestException('Payment đã tạo không thể xóa.');
  }
}
