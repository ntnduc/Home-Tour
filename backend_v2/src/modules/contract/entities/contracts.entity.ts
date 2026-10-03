import { Invoice } from 'src/modules/invoice/entities/invoice.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/Entity/base.entity';
import { ContractStatus } from '../../../common/enums/contract.enum';
import { Properties } from '../../property/entities/properties.entity';
import { Rooms } from '../../property/entities/rooms.entity';
import { ContractClient } from './contract-client.entity';
import { ContractServices } from './contract-services.entity';

@Entity('contracts')
@Unique(['code', 'propertyId'])
export class Contracts extends BaseEntity {
  @ManyToOne(() => Properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Properties;

  @Column()
  propertyId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  code: string;

  @ManyToOne(() => Rooms, (rooms) => rooms.contracts)
  @JoinColumn({ name: 'roomId' })
  room: Rooms;

  @Column()
  roomId: string;

  @Column({ type: 'int', default: 0 })
  partnerClientCount: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  // tiền thuê
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  rentAmountAgreed: number;

  // tiền cọc
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  depositAmountPaid: number;

  // ngày thanh toán tiền thuê
  @Column()
  paymentDueDay: number;

  @Column({ nullable: true })
  contractScanURL?: string;

  @Column({ nullable: true, default: true })
  isPrepaidRoom?: boolean;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING_START,
  })
  status: ContractStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Có tự động cộng dồn công nợ còn lại của hóa đơn trước sang hóa đơn kỳ tiếp theo hay không.
  @Column({ type: 'boolean', default: true })
  carryDebtToNextInvoice: boolean;

  @OneToMany(() => ContractClient, (contractClient) => contractClient.contract)
  contractClient: ContractClient[];

  @OneToMany(
    () => ContractServices,
    (contractServices) => contractServices.contract,
  )
  contractServices: ContractServices[];

  @OneToMany(() => Invoice, (invoice) => invoice.contract)
  invoices: Invoice[];
}
