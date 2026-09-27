import { BaseListDto } from '../../../../common/base/dto/list.dto';
import { InvoiceItemType } from '../../../../common/enums/invoice.enum';
import { InvoiceItem } from '../../entities/invoice.item.entity';

export class InvoiceItemListDto extends BaseListDto<InvoiceItem> {
  name?: string;
  invoiceId: string;
  amount: number;
  type: InvoiceItemType;
  createdAt: Date;
  updatedAt?: Date;

  fromEntity(entity: InvoiceItem): void {
    this.id = entity.id;
    this.name = entity.name;
    this.invoiceId = entity.invoiceId;
    this.amount = entity.amount ? Number(entity.amount) : 0;
    this.type = entity.type;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
