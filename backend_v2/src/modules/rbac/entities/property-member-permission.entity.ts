import { Properties } from 'src/modules/property/entities/properties.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

// Per (user, property) deviation from the member's role permissions:
// granted=true adds a permission the role lacks, granted=false revokes one it has.
@Entity('property_member_permissions')
export class PropertyMemberPermission {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  propertyId: string;

  @PrimaryColumn({ type: 'varchar', length: 100 })
  permission: string;

  @Column({ type: 'boolean' })
  granted: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Properties;
}
