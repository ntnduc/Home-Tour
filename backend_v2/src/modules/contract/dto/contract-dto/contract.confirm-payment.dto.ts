import { IsOptional, IsString } from 'class-validator';

export class ContractConfirmPaymentDto {
  @IsString({ message: 'Phương thức thanh toán không hợp lệ' })
  @IsOptional()
  paymentMethod?: string;

  @IsString({ message: 'Ghi chú không hợp lệ' })
  @IsOptional()
  notes?: string;
}
