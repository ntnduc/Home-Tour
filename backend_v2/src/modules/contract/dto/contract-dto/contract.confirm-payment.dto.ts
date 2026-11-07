import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ContractConfirmPaymentDto {
  @IsString({ message: 'Phương thức thanh toán không hợp lệ' })
  @IsOptional()
  paymentMethod?: string;

  @IsString({ message: 'Ghi chú không hợp lệ' })
  @IsOptional()
  notes?: string;

  /** Amount received; defaults to the whole remaining balance. */
  @IsNumber()
  @Min(0, { message: 'Số tiền thanh toán không hợp lệ' })
  @IsOptional()
  paidAmount?: number;

  /** Carry an unpaid balance over to the next invoice (settles the invoice). */
  @IsBoolean()
  @IsOptional()
  isCarryOver?: boolean;
}
