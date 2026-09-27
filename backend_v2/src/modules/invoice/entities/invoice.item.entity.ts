import { InvoiceItemType } from 'src/common/enums/invoice.enum';
import { ContractServices } from 'src/modules/contract/entities/contract-services.entity';
import { Properties } from 'src/modules/property/entities/properties.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base/Entity/base.entity';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {
  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column()
  invoiceId: string;

  @Column({ type: 'text', nullable: true })
  name?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: InvoiceItemType })
  type: InvoiceItemType;

  @Column({ default: 0, nullable: true })
  helperValue?: number;

  @Column({ nullable: true })
  contractServiceId?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  calculationMethod?: string;

  @Column({ nullable: true })
  oldHelperValue?: number;

  @ManyToOne(() => ContractServices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractServiceId' })
  contractService?: ContractServices;

  @Column()
  propertyId: string;

  @ManyToOne(() => Properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Properties;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
