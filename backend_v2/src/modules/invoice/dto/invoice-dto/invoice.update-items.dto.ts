import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

// Thông tin của một khoản mục hóa đơn cần cập nhật giá.
export class InvoiceItemPriceUpdateDto {
  @IsUUID()
  id: string;

  @IsNumber()
  @Min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' })
  amount: number;
}

// Payload cập nhật giá các khoản mục của một hóa đơn.
export class InvoiceUpdateItemsDto {
  // ID của hóa đơn cần cập nhật khoản mục.
  @IsUUID()
  id: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Cần ít nhất một khoản mục để cập nhật' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemPriceUpdateDto)
  invoiceItems: InvoiceItemPriceUpdateDto[];
}
