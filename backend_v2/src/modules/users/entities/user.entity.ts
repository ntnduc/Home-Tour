import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/Entity/base.entity';
import { Properties } from '../../property/entities/properties.entity';
import { UserRole } from '../../rbac/entities/user-role.entity';
export interface UserSettings {
  invoiceReminder: boolean;
  contractExpiryReminder: boolean;
  paymentReceived: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  invoiceReminder: true,
  contractExpiryReminder: true,
  paymentReceived: true,
};

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

  // FileEntry id of the current avatar (served by GET api/upload-file/:id)
  @Column({ type: 'uuid', nullable: true })
  avatarFileId?: string | null;

  // Per-user app preferences (notification toggles)
  @Column({ type: 'jsonb', nullable: true })
  settings?: UserSettings | null;

  @OneToMany(() => Properties, (property) => property.owner)
  properties: Properties[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}
