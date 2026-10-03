import { Contracts } from 'src/modules/contract/entities/contracts.entity';
import { Invoice } from 'src/modules/invoice/entities/invoice.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/Entity/base.entity';
import { RoomStatus } from './../../../common/enums/room.enum';
import { Properties } from './properties.entity';

@Entity('rooms')
export class Rooms extends BaseEntity {
  @ManyToOne(() => Properties, (properties) => properties.rooms)
  @JoinColumn({ name: 'propertyId' })
  property: Properties;

  @Column()
  propertyId: string;

  @Column()
  name: string;

  //Diện tích phòng
  @Column({ nullable: true })
  area?: number;

  //Giá thuê phòng cơ bản
  @Column()
  rentAmount: number;

  //Số người tối đa
  @Column({ nullable: true })
  maxOccupancy?: number;

  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.AVAILABLE })
  status: RoomStatus;

  @Column({ nullable: true })
  floor?: string;

  //Tiền cọc mặc định
  @Column()
  defaultDepositAmount: number;

  //Ngày hạn thanh toán mặc định
  @Column()
  defaultPaymentDueDay: number;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Contracts, (contract) => contract.room)
  contracts: Contracts[];

  @OneToMany(() => Invoice, (invoice) => invoice.room)
  invoices: Invoice[];

  @Column({ nullable: true, default: true })
  isPrepaidRoom?: boolean;

  @Column({ nullable: true })
  imageCollectionId?: string;
}
