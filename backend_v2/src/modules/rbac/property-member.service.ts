import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionTreeService } from 'src/common/services/permission-tree.service';
import { Role } from 'src/common/enums/role.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { Properties } from '../property/entities/properties.entity';
import { User } from '../users/entities/user.entity';
import {
  InvitationStatus,
  PropertyInvitation,
} from './entities/property-invitation.entity';
import { PropertyMemberPermission } from './entities/property-member-permission.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { applyPermissionOverrides } from './permission-overrides';

export type MemberStatus = 'ACTIVE' | 'PENDING';

export interface PropertyMemberDto {
  status: MemberStatus;
  userId: string;
  fullName: string;
  phone: string;
  roleId: string;
  roleName: string;
  isOwner: boolean;
  invitationId?: string;
  // Effective permissions (role + overrides); empty while pending
  permissions: string[];
  since: Date;
}

export interface PermissionGroupDto {
  group: string;
  permissions: string[];
}

export interface MyInvitationDto {
  id: string;
  propertyId: string;
  propertyName: string;
  invitedByName: string;
  roleName: string;
  createdAt: Date;
}

// Permission groups that are never delegated per member
const HIDDEN_PERMISSION_GROUPS = ['SYSTEM'];

/**
 * Per-property membership management. Authorization is checked against
 * user_roles in the DB (never the JWT claims), so it is always current.
 */
@Injectable()
export class PropertyMemberService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Properties)
    private readonly propertyRepository: Repository<Properties>,
    @InjectRepository(PropertyInvitation)
    private readonly invitationRepository: Repository<PropertyInvitation>,
    @InjectRepository(PropertyMemberPermission)
    private readonly overrideRepository: Repository<PropertyMemberPermission>,
    private readonly permissionTreeService: PermissionTreeService,
    private readonly dataSource: DataSource,
  ) {}

  /** Caller must be OWNER of this property (or a system Admin). */
  async assertCanManage(actorId: string, propertyId: string): Promise<void> {
    const roles = await this.userRoleRepository.find({
      where: { userId: actorId },
      relations: ['role'],
    });
    const isAdmin = roles.some((r) => r.role?.roleName === Role.ADMIN);
    const isOwner = roles.some(
      (r) => r.propertyId === propertyId && r.role?.roleName === Role.OWNER,
    );
    if (isAdmin || isOwner) return;

    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });
    if (property?.ownerId === actorId) return;

    throw new ForbiddenException(
      'Bạn không có quyền quản lý thành viên của căn hộ này',
    );
  }

  /** Leaf permissions grouped by functional area (SYSTEM excluded). */
  getPermissionCatalog(): PermissionGroupDto[] {
    const groups = new Map<string, string[]>();
    for (const id of this.permissionTreeService.getLeafPermissions()) {
      const group = id.split('.')[0];
      if (HIDDEN_PERMISSION_GROUPS.includes(group)) continue;
      groups.set(group, [...(groups.get(group) ?? []), id]);
    }
    return Array.from(groups, ([group, permissions]) => ({
      group,
      permissions,
    }));
  }

  /** Active members (with effective permissions) followed by pending invitations. */
  async listMembers(
    actorId: string,
    propertyId: string,
  ): Promise<PropertyMemberDto[]> {
    await this.assertCanManage(actorId, propertyId);

    const rows = await this.userRoleRepository.find({
      where: { propertyId },
      relations: [
        'user',
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permission',
      ],
    });
    const overrides = await this.overrideRepository.find({
      where: { propertyId },
    });

    const members: PropertyMemberDto[] = rows.map((r) => {
      const rolePermissions =
        r.role?.rolePermissions?.map((rp) => rp.permission.permissionName) ??
        [];
      return {
        status: 'ACTIVE',
        userId: r.userId,
        fullName: r.user?.fullName,
        phone: r.user?.phone,
        roleId: r.roleId,
        roleName: r.role?.roleName,
        isOwner: r.role?.roleName === Role.OWNER,
        permissions: applyPermissionOverrides(
          rolePermissions,
          overrides.filter((o) => o.userId === r.userId),
        ),
        since: r.assignedDate,
      };
    });
    // Owners first, then by name
    members.sort(
      (a, b) =>
        Number(b.isOwner) - Number(a.isOwner) ||
        (a.fullName ?? '').localeCompare(b.fullName ?? ''),
    );

    const pending = await this.invitationRepository.find({
      where: { propertyId, status: InvitationStatus.PENDING },
      relations: ['invitee', 'role'],
      order: { createdAt: 'DESC' },
    });
    const pendingDtos: PropertyMemberDto[] = pending.map((i) => ({
      status: 'PENDING',
      userId: i.inviteeUserId,
      fullName: i.invitee?.fullName,
      phone: i.invitee?.phone,
      roleId: i.roleId,
      roleName: i.role?.roleName,
      isOwner: false,
      invitationId: i.id,
      permissions: [],
      since: i.createdAt,
    }));

    return [...members, ...pendingDtos];
  }

  /**
   * Create a PENDING invitation for a registered user (by phone).
   * The user joins the property only after accepting it.
   */
  async invite(
    actorId: string,
    propertyId: string,
    phone: string,
    roleId?: string,
  ): Promise<PropertyInvitation> {
    await this.assertCanManage(actorId, propertyId);

    const formatted = AuthService.formatPhoneNumber(phone ?? '');
    if (!/^\+84\d{9}$/.test(formatted)) {
      throw new BadRequestException('Số điện thoại không hợp lệ');
    }
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy căn hộ');

    const user = await this.userRepository.findOne({
      where: { phone: formatted },
    });
    if (!user) {
      throw new NotFoundException('Số điện thoại chưa đăng ký tài khoản');
    }
    if (!user.isActive) {
      throw new BadRequestException('Tài khoản người dùng đã bị khóa');
    }
    if (user.id === actorId) {
      throw new BadRequestException('Bạn không thể tự mời chính mình');
    }

    const existingMember = await this.userRoleRepository.findOne({
      where: { userId: user.id, propertyId },
    });
    if (existingMember) {
      throw new ConflictException('Người dùng đã là thành viên của căn hộ này');
    }
    const existingInvite = await this.invitationRepository.findOne({
      where: {
        propertyId,
        inviteeUserId: user.id,
        status: InvitationStatus.PENDING,
      },
    });
    if (existingInvite) {
      throw new ConflictException('Đã gửi lời mời cho người dùng này');
    }

    const role = roleId
      ? await this.roleRepository.findOne({ where: { id: roleId } })
      : await this.roleRepository.findOne({
          where: { roleName: Role.PROPERTY_MANAGER },
        });
    if (!role) throw new NotFoundException('Không tìm thấy vai trò');
    this.assertAssignable(role);

    return this.invitationRepository.save({
      propertyId,
      inviteeUserId: user.id,
      invitedById: actorId,
      roleId: role.id,
      status: InvitationStatus.PENDING,
    });
  }

  async cancelInvitation(
    actorId: string,
    propertyId: string,
    invitationId: string,
  ): Promise<void> {
    await this.assertCanManage(actorId, propertyId);
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, propertyId, status: InvitationStatus.PENDING },
    });
    if (!invitation) throw new NotFoundException('Không tìm thấy lời mời');
    await this.invitationRepository.update(invitation.id, {
      status: InvitationStatus.CANCELLED,
      respondedAt: new Date(),
    });
  }

  async listMyInvitations(userId: string): Promise<MyInvitationDto[]> {
    const rows = await this.invitationRepository.find({
      where: { inviteeUserId: userId, status: InvitationStatus.PENDING },
      relations: ['property', 'invitedBy', 'role'],
      order: { createdAt: 'DESC' },
    });
    return rows.map((i) => ({
      id: i.id,
      propertyId: i.propertyId,
      propertyName: i.property?.name,
      invitedByName: i.invitedBy?.fullName,
      roleName: i.role?.roleName,
      createdAt: i.createdAt,
    }));
  }

  /** Invitee accepts: only now the user_roles row is created. */
  async acceptInvitation(userId: string, invitationId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const invitation = await this.findOwnPendingInvitation(
        manager,
        userId,
        invitationId,
      );
      const exists = await manager.findOne(UserRole, {
        where: { userId, propertyId: invitation.propertyId },
      });
      if (exists) {
        throw new ConflictException('Bạn đã là thành viên của căn hộ này');
      }
      await manager.save(UserRole, {
        userId,
        roleId: invitation.roleId,
        propertyId: invitation.propertyId,
        assignedDate: new Date(),
      });
      await manager.update(PropertyInvitation, invitation.id, {
        status: InvitationStatus.ACCEPTED,
        respondedAt: new Date(),
      });
    });
  }

  async declineInvitation(userId: string, invitationId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const invitation = await this.findOwnPendingInvitation(
        manager,
        userId,
        invitationId,
      );
      await manager.update(PropertyInvitation, invitation.id, {
        status: InvitationStatus.DECLINED,
        respondedAt: new Date(),
      });
    });
  }

  /**
   * Set the user's single role for this property (adds or replaces).
   * Roles of the same user in other properties are untouched.
   */
  async setRole(
    actorId: string,
    propertyId: string,
    userId: string,
    roleId: string,
  ): Promise<UserRole> {
    await this.assertCanManage(actorId, propertyId);

    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy căn hộ');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    if (!user.isActive) {
      throw new BadRequestException('Tài khoản người dùng đã bị khóa');
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Không tìm thấy vai trò');
    this.assertAssignable(role);

    return this.dataSource.transaction(async (manager) => {
      const current = await manager.find(UserRole, {
        where: { userId, propertyId },
        relations: ['role'],
      });
      if (current.some((c) => c.roleId === roleId)) {
        throw new ConflictException('Người dùng đã có vai trò này');
      }
      if (
        current.some((c) => c.role?.roleName === Role.OWNER) &&
        role.roleName !== Role.OWNER
      ) {
        await this.assertAnotherOwnerExists(manager, propertyId, userId);
      }
      if (current.length > 0) {
        await manager.delete(UserRole, { userId, propertyId });
        // A new role starts from its own default permissions
        await manager.delete(PropertyMemberPermission, { userId, propertyId });
      }
      return manager.save(UserRole, {
        userId,
        roleId,
        propertyId,
        assignedDate: new Date(),
      });
    });
  }

  /** Enable/disable one permission for an ACTIVE, non-owner member. */
  async setMemberPermission(
    actorId: string,
    propertyId: string,
    userId: string,
    permission: string,
    granted: boolean,
  ): Promise<string[]> {
    await this.assertCanManage(actorId, propertyId);

    const allowed = this.getPermissionCatalog().some((g) =>
      g.permissions.includes(permission),
    );
    if (!allowed) throw new BadRequestException('Quyền không hợp lệ');

    const memberRoles = await this.userRoleRepository.find({
      where: { userId, propertyId },
      relations: [
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permission',
      ],
    });
    if (memberRoles.length === 0) {
      const pending = await this.invitationRepository.findOne({
        where: {
          propertyId,
          inviteeUserId: userId,
          status: InvitationStatus.PENDING,
        },
      });
      if (pending) {
        throw new BadRequestException(
          'Lời mời chưa được chấp nhận, chưa thể chỉnh quyền',
        );
      }
      throw new NotFoundException('Không tìm thấy thành viên');
    }
    if (memberRoles.some((m) => m.role?.roleName === Role.OWNER)) {
      throw new BadRequestException('Không thể thay đổi quyền của chủ sở hữu');
    }

    const roleDefaults = new Set(
      memberRoles.flatMap(
        (m) =>
          m.role?.rolePermissions?.map((rp) => rp.permission.permissionName) ??
          [],
      ),
    );
    if (granted === roleDefaults.has(permission)) {
      // Matches the role default: no override needed
      await this.overrideRepository.delete({ userId, propertyId, permission });
    } else {
      await this.overrideRepository.save({
        userId,
        propertyId,
        permission,
        granted,
      });
    }

    const overrides = await this.overrideRepository.find({
      where: { userId, propertyId },
    });
    return applyPermissionOverrides(Array.from(roleDefaults), overrides);
  }

  async removeMember(
    actorId: string,
    propertyId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    await this.assertCanManage(actorId, propertyId);
    await this.dataSource.transaction(async (manager) => {
      const row = await manager.findOne(UserRole, {
        where: { userId, propertyId, roleId },
        relations: ['role'],
      });
      if (!row) throw new NotFoundException('Không tìm thấy thành viên');
      if (row.role?.roleName === Role.OWNER) {
        await this.assertAnotherOwnerExists(manager, propertyId, userId);
      }
      await manager.delete(UserRole, { userId, propertyId, roleId });
      await manager.delete(PropertyMemberPermission, { userId, propertyId });
    });
  }

  private assertAssignable(role: RoleEntity): void {
    if (role.roleName === Role.ADMIN) {
      throw new BadRequestException('Không thể gán vai trò quản trị hệ thống');
    }
  }

  private async findOwnPendingInvitation(
    manager: EntityManager,
    userId: string,
    invitationId: string,
  ): Promise<PropertyInvitation> {
    const invitation = await manager.findOne(PropertyInvitation, {
      where: {
        id: invitationId,
        inviteeUserId: userId,
        status: InvitationStatus.PENDING,
      },
    });
    if (!invitation) throw new NotFoundException('Không tìm thấy lời mời');
    return invitation;
  }

  private async assertAnotherOwnerExists(
    manager: EntityManager,
    propertyId: string,
    excludeUserId: string,
  ): Promise<void> {
    const owners = await manager
      .createQueryBuilder(UserRole, 'ur')
      .innerJoin('ur.role', 'role')
      .where('ur.propertyId = :propertyId', { propertyId })
      .andWhere('role.roleName = :ownerRole', { ownerRole: Role.OWNER })
      .andWhere('ur.userId != :excludeUserId', { excludeUserId })
      .getCount();
    if (owners === 0) {
      throw new BadRequestException('Căn hộ phải có ít nhất một chủ sở hữu');
    }
  }
}
