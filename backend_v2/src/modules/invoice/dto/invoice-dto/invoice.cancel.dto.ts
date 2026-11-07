import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class InvoiceCancelDto {
  @IsUUID('all', { message: 'Mã hóa đơn không hợp lệ' })
  id: string;

  @IsString({ message: 'Lý do hủy không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng nhập lý do hủy hóa đơn' })
  @MaxLength(500, { message: 'Lý do hủy tối đa 500 ký tự' })
  reason: string;
}
