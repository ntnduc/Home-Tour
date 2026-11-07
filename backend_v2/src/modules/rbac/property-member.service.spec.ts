import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { PermissionTreeService } from 'src/common/services/permission-tree.service';
import { applyPermissionOverrides } from './permission-overrides';
import { PropertyMemberService } from './property-member.service';

const role = (id: string, roleName: string, perms: string[] = []) => ({
  id,
  roleName,
  rolePermissions: perms.map((p) => ({ permission: { permissionName: p } })),
});

function build(opts: {
  actorRoles?: any[];
  roles?: Record<string, any>;
  roleByName?: any;
  user?: any;
  members?: any[];
  current?: any[];
  otherOwners?: number;
  pendingInvite?: any;
  existingMember?: any;
}) {
  const userRoleRepo: any = {
    find: jest.fn(({ where }) =>
      Promise.resolve(
        where.propertyId && where.userId
          ? (opts.members ?? [])
          : (opts.actorRoles ?? []),
      ),
    ),
    findOne: jest.fn().mockResolvedValue(opts.existingMember ?? null),
  };
  const roleRepo: any = {
    findOne: jest.fn(({ where }) =>
      Promise.resolve(
        where.id ? (opts.roles?.[where.id] ?? null) : (opts.roleByName ?? null),
      ),
    ),
  };
  const userRepo: any = {
    findOne: jest.fn().mockResolvedValue(opts.user ?? null),
  };
  const propRepo: any = {
    findOne: jest.fn().mockResolvedValue({ id: 'p1', ownerId: 'nobody' }),
  };
  const invitationRepo: any = {
    findOne: jest.fn().mockResolvedValue(opts.pendingInvite ?? null),
    save: jest.fn((v) => Promise.resolve(v)),
  };
  const overrideRepo: any = {
    delete: jest.fn(),
    save: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
  };
  const manager: any = {
    find: jest.fn().mockResolvedValue(opts.current ?? []),
    findOne: jest.fn().mockResolvedValue(null),
    delete: jest.fn(),
    update: jest.fn(),
    save: jest.fn((_e, v) => Promise.resolve(v)),
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(opts.otherOwners ?? 0),
    }),
  };
  const dataSource: any = { transaction: (cb: any) => cb(manager) };
  const service = new PropertyMemberService(
    userRoleRepo,
    roleRepo,
    userRepo,
    propRepo,
    invitationRepo,
    overrideRepo,
    new PermissionTreeService(),
    dataSource,
  );
  return { service, manager, invitationRepo, overrideRepo };
}

const ownerOfP1 = [{ propertyId: 'p1', role: role('r-owner', Role.OWNER) }];
const activeUser = { id: 'u2', isActive: true, phone: '+84900000001' };

describe('PropertyMemberService', () => {
  describe('setRole', () => {
    it('rejects a caller who owns a different property only', async () => {
      const { service } = build({
        actorRoles: [{ propertyId: 'p2', role: role('r-owner', Role.OWNER) }],
      });
      await expect(
        service.setRole('u1', 'p1', 'u2', 'r1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('never assigns the system Admin role', async () => {
      const { service } = build({
        actorRoles: ownerOfP1,
        user: activeUser,
        roles: { ra: role('ra', Role.ADMIN) },
      });
      await expect(
        service.setRole('u1', 'p1', 'u2', 'ra'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects the same role twice (409)', async () => {
      const { service } = build({
        actorRoles: ownerOfP1,
        user: activeUser,
        roles: { rm: role('rm', Role.PROPERTY_MANAGER) },
        current: [{ roleId: 'rm', role: role('rm', Role.PROPERTY_MANAGER) }],
      });
      await expect(
        service.setRole('u1', 'p1', 'u2', 'rm'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows an owner to promote another user to OWNER', async () => {
      const { service, manager } = build({
        actorRoles: ownerOfP1,
        user: activeUser,
        roles: { ro: role('ro', Role.OWNER) },
      });
      await service.setRole('u1', 'p1', 'u2', 'ro');
      expect(manager.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'u2',
          roleId: 'ro',
          propertyId: 'p1',
        }),
      );
    });

    it('blocks demoting the last owner', async () => {
      const { service } = build({
        actorRoles: ownerOfP1,
        user: activeUser,
        roles: { rt: role('rt', Role.TENANT) },
        current: [{ roleId: 'ro', role: role('ro', Role.OWNER) }],
        otherOwners: 0,
      });
      await expect(
        service.setRole('u1', 'p1', 'u2', 'rt'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('invite', () => {
    const manager = role('rm', Role.PROPERTY_MANAGER);

    it('rejects an invalid phone number', async () => {
      const { service } = build({ actorRoles: ownerOfP1 });
      await expect(
        service.invite('u1', 'p1', '12ab', undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('fails for an unregistered phone', async () => {
      const { service } = build({ actorRoles: ownerOfP1 });
      await expect(
        service.invite('u1', 'p1', '0900000009'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects an existing member (409)', async () => {
      const { service } = build({
        actorRoles: ownerOfP1,
        user: activeUser,
        existingMember: { userId: 'u2' },
      });
      await expect(
        service.invite('u1', 'p1', '0900000001'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects a duplicate pending invitation (409)', async () => {
      const { service } = build({
        actorRoles: ownerOfP1,
        user: activeUser,
        pendingInvite: { id: 'i1' },
      });
      await expect(
        service.invite('u1', 'p1', '0900000001'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates a PENDING invitation without adding the user to user_roles', async () => {
      const {
        service,
        invitationRepo,
        manager: m,
      } = build({
        actorRoles: ownerOfP1,
        user: activeUser,
        roleByName: manager,
      });
      await service.invite('u1', 'p1', '0900000001');
      expect(invitationRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PENDING',
          inviteeUserId: 'u2',
          roleId: 'rm',
        }),
      );
      expect(m.save).not.toHaveBeenCalled();
    });
  });

  describe('setMemberPermission', () => {
    it('refuses to edit a member whose invitation is still pending', async () => {
      const { service } = build({
        actorRoles: ownerOfP1,
        members: [],
        pendingInvite: { id: 'i1' },
      });
      await expect(
        service.setMemberPermission('u1', 'p1', 'u2', 'ROOM.EDIT', true),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('refuses to edit the owner', async () => {
      const { service } = build({
        actorRoles: ownerOfP1,
        members: [{ role: role('ro', Role.OWNER) }],
      });
      await expect(
        service.setMemberPermission('u1', 'p1', 'u2', 'ROOM.EDIT', false),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects unknown and SYSTEM permissions', async () => {
      const { service } = build({ actorRoles: ownerOfP1 });
      await expect(
        service.setMemberPermission('u1', 'p1', 'u2', 'SYSTEM.MANAGE', true),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('stores an override only when it differs from the role default', async () => {
      const { service, overrideRepo } = build({
        actorRoles: ownerOfP1,
        members: [{ role: role('rm', Role.PROPERTY_MANAGER, ['ROOM.VIEW']) }],
      });
      await service.setMemberPermission('u1', 'p1', 'u2', 'ROOM.EDIT', true);
      expect(overrideRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ permission: 'ROOM.EDIT', granted: true }),
      );
      await service.setMemberPermission('u1', 'p1', 'u2', 'ROOM.VIEW', true);
      expect(overrideRepo.delete).toHaveBeenCalled();
    });
  });

  it('catalog excludes SYSTEM and groups by area', () => {
    const { service } = build({});
    const groups = service.getPermissionCatalog();
    expect(groups.some((g) => g.group === 'SYSTEM')).toBe(false);
    expect(groups.find((g) => g.group === 'ROOM')?.permissions).toContain(
      'ROOM.EDIT',
    );
  });
});

describe('applyPermissionOverrides', () => {
  it('adds grants and removes revokes', () => {
    expect(
      applyPermissionOverrides(
        ['A', 'B'],
        [
          { permission: 'B', granted: false },
          { permission: 'C', granted: true },
        ],
      ).sort(),
    ).toEqual(['A', 'C']);
  });
});
