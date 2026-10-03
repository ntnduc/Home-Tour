import { InvoiceStatus } from 'src/common/enums/invoice.enum';
import { Contracts } from 'src/modules/contract/entities/contracts.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { Properties } from 'src/modules/property/entities/properties.entity';
import { Rooms } from 'src/modules/property/entities/rooms.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/Entity/base.entity';
import { InvoiceItem } from './invoice.item.entity';

@Entity('invoices')
export class Invoice extends BaseEntity {
  // Hợp đồng đang được lập hóa đơn.
  @ManyToOne(() => Contracts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractId' })
  contract: Contracts;

  // ID của hợp đồng liên kết với hóa đơn.
  @Column()
  contractId: string;

  // ID phòng được xuất hóa đơn.
  @Column()
  roomId: string;

  // Thông tin phòng được xuất hóa đơn.
  @ManyToOne(() => Rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Rooms;

  // ID nhà trọ / tài sản chứa phòng được xuất hóa đơn.
  @Column()
  propertyId: string;

  // Thông tin nhà trọ / tài sản chứa phòng được xuất hóa đơn.
  @ManyToOne(() => Properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Properties;

  // Mã hóa đơn để hiển thị hoặc tra cứu.
  @Column({ type: 'varchar', length: 255, nullable: true })
  code?: string;

  // Ngày bắt đầu kỳ tính tiền của hóa đơn.
  @Column({ type: 'date' })
  billingPeriodStart: Date;

  // Ngày kết thúc kỳ tính tiền của hóa đơn.
  @Column({ type: 'date' })
  billingPeriodEnd: Date;

  // Hạn cuối khách cần thanh toán hóa đơn.
  @Column({ type: 'date' })
  dueDate: Date;

  // Tổng số tiền phải thu của toàn bộ hóa đơn.
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  // Số tiền đã được thanh toán cho hóa đơn.
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  paidAmount: number;

  // Số tiền còn lại cần thanh toán = tổng tiền - đã thanh toán.
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remainingAmount: number;

  // Trạng thái hiện tại của hóa đơn: nháp, chờ thanh toán, quá hạn, đã thanh toán...
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  // Ghi chú bổ sung cho hóa đơn.
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // ID của hóa đơn liền trước cùng hợp đồng/phòng, dùng để truy vết kỳ hóa đơn trước đó.
  @Column({ nullable: true })
  preInvoiceId?: string;

  // Danh sách các dòng chi tiết cấu thành hóa đơn.
  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice, {
    cascade: true,
  })
  invoiceItems: InvoiceItem[];

  // Danh sách các lần thanh toán đã ghi nhận cho hóa đơn.
  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];

  calculatorTotalAmount(): number {
    return this.invoiceItems.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );
  }
}
