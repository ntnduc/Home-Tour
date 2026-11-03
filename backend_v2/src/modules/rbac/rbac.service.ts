import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission, Role } from 'src/common/enums/role.enum';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleEntity } from './entities/role.entity';
import { PropertyMemberPermission } from './entities/property-member-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { applyPermissionOverrides } from './permission-overrides';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRoleRepository } from './repositories/user-role.repository';

export interface UserProperty {
  propertyId: string;
  role: string;
  permissions: string[];
}

@Injectable()
export class RbacService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    private roleRepository: RoleRepository,
    private permissionRepository: PermissionRepository,
    private userRoleRepository: UserRoleRepository,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(PropertyMemberPermission)
    private memberPermissionRepository: Repository<PropertyMemberPermission>,
  ) {}

  /**
   * Seed default roles / permissions on first run (or when role_permissions is empty).
   * Skipped once everything exists, so later admin edits to role permissions are kept.
   */
  async onApplicationBootstrap(): Promise<void> {
    try {
      const roles = await Promise.all(
        Object.values(Role).map((name) => this.roleRepository.findByName(name)),
      );
      const rolePermissionCount = await this.rolePermissionRepository.count();
      if (roles.every(Boolean) && rolePermissionCount > 0) return;

      this.logger.log('Seeding default roles and permissions');
      await this.initializeDefaultRolesAndPermissions();
    } catch (error) {
      this.logger.error('Failed to seed default roles and permissions', error);
    }
  }

  // Role management
  async createRole(
    roleName: string,
    description?: string,
  ): Promise<RoleEntity> {
    const existingRole = await this.roleRepository.findByName(roleName);
    if (existingRole) {
      throw new BadRequestException(`Role ${roleName} already exists`);
    }

    const role = new RoleEntity();
    role.roleName = roleName;
    role.description = description ?? '';

    return this.roleRepository.save(role);
  }

  async getAllRoles(): Promise<RoleEntity[]> {
    return this.roleRepository.find();
  }

  async getRoleById(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findWithPermissions(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  // Permission management
  async createPermission(
    permissionName: string,
    description?: string,
  ): Promise<PermissionEntity> {
    const existingPermission =
      await this.permissionRepository.findByName(permissionName);
    if (existingPermission) {
      throw new BadRequestException(
        `Permission ${permissionName} already exists`,
      );
    }

    const permission = new PermissionEntity();
    permission.permissionName = permissionName;
    permission.description = description ?? '';

    return this.permissionRepository.save(permission);
  }

  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.permissionRepository.find();
  }

  // Role-Permission management
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`,
      );
    }

    const existingRolePermission = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });

    if (existingRolePermission) {
      throw new BadRequestException('Permission already assigned to role');
    }

    const rolePermission = new RolePermission();
    rolePermission.roleId = roleId;
    rolePermission.permissionId = permissionId;

    await this.rolePermissionRepository.save(rolePermission);
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId, permissionId });
  }

  // User-Role management
  async assignUserRole(
    userId: string,
    roleId: string,
    propertyId: string,
  ): Promise<UserRole> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return this.userRoleRepository.assignRole(userId, roleId, propertyId);
  }

  async removeUserRole(
    userId: string,
    roleId: string,
    propertyId: string,
  ): Promise<void> {
    await this.userRoleRepository.removeRole(userId, roleId, propertyId);
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.findByUserId(userId);
  }

  async getUserRolesForProperty(
    userId: string,
    propertyId: string,
  ): Promise<UserRole[]> {
    return this.userRoleRepository.findByUserIdAndPropertyId(
      userId,
      propertyId,
    );
  }

  // Permission checking
  async getUserPermissions(
    userId: string,
    propertyId?: string,
  ): Promise<Permission[]> {
    let userRoles: UserRole[];

    if (propertyId) {
      userRoles = await this.userRoleRepository.findByUserIdAndPropertyId(
        userId,
        propertyId,
      );
    } else {
      userRoles = await this.userRoleRepository.findByUserId(userId);
    }

    const permissions = new Set<Permission>();

    for (const userRole of userRoles) {
      if (userRole.role?.rolePermissions) {
        for (const rolePermission of userRole.role.rolePermissions) {
          permissions.add(
            rolePermission.permission.permissionName as Permission,
          );
        }
      }
    }

    return Array.from(permissions);
  }

  async hasPermission(
    userId: string,
    permission: Permission,
    propertyId?: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, propertyId);
    return userPermissions.includes(permission);
  }

  async hasPropertyAccess(
    userId: string,
    propertyId: string,
  ): Promise<boolean> {
    return this.userRoleRepository.hasPropertyAccess(userId, propertyId);
  }

  // JWT Token helpers
  async generateUserProperties(userId: string): Promise<UserProperty[]> {
    const userRoles = await this.userRoleRepository.findByUserId(userId);

    const properties: UserProperty[] = [];
    const overrides = await this.memberPermissionRepository.find({
      where: { userId },
    });

    for (const userRole of userRoles) {
      const rolePermissions =
        userRole.role?.rolePermissions?.map(
          (rp) => rp.permission.permissionName,
        ) || [];
      // Per-member switches (grant/revoke) for this property
      const permissions = applyPermissionOverrides(
        rolePermissions,
        overrides.filter((o) => o.propertyId === userRole.propertyId),
      );

      properties.push({
        propertyId: userRole.propertyId,
        role: userRole.role.roleName,
        permissions,
      });
    }

    return properties;
  }

  // Initialize default roles and permissions
  async initializeDefaultRolesAndPermissions(): Promise<void> {
    // Create default roles
    const defaultRoles = [
      { name: Role.ADMIN, description: 'System Administrator' },
      { name: Role.OWNER, description: 'Property Owner' },
      { name: Role.PROPERTY_MANAGER, description: 'Property Manager' },
      { name: Role.ACCOUNTANT, description: 'Accountant' },
      { name: Role.TENANT, description: 'Tenant' },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.roleRepository.findByName(roleData.name);
      if (!existingRole) {
        await this.createRole(roleData.name, roleData.description);
      }
    }

    // Create default permissions
    const defaultPermissions = Object.values(Permission).map((permission) => ({
      name: permission,
      description: `Permission to ${permission.toLowerCase().replace(/_/g, ' ')}`,
    }));

    for (const permissionData of defaultPermissions) {
      const existingPermission = await this.permissionRepository.findByName(
        permissionData.name,
      );
      if (!existingPermission) {
        await this.createPermission(
          permissionData.name,
          permissionData.description,
        );
      }
    }

    // Assign permissions to roles
    await this.assignDefaultPermissionsToRoles();
  }

  private async assignDefaultPermissionsToRoles(): Promise<void> {
    // Admin gets all permissions
    const adminRole = await this.roleRepository.findByName(Role.ADMIN);
    const allPermissions = await this.permissionRepository.find();

    if (adminRole) {
      for (const permission of allPermissions) {
        try {
          await this.assignPermissionToRole(adminRole.id, permission.id);
        } catch (error) {
          // Permission already assigned, continue
        }
      }
    }

    // Owner permissions
    const ownerRole = await this.roleRepository.findByName(Role.OWNER);
    const ownerPermissions = [
      Permission.CREATE_PROPERTY,
      Permission.EDIT_PROPERTY,
      Permission.VIEW_PROPERTY,
      Permission.CREATE_ROOM,
      Permission.EDIT_ROOM,
      Permission.VIEW_ROOM,
      Permission.CREATE_SERVICE,
      Permission.EDIT_SERVICE,
      Permission.VIEW_SERVICE,
      Permission.VIEW_FINANCIAL_REPORT,
      Permission.VIEW_OCCUPANCY_REPORT,
      Permission.VIEW_DEBT_REPORT,
      Permission.CREATE_USER,
      Permission.ASSIGN_ROLE,
    ];

    if (ownerRole) {
      for (const permissionName of ownerPermissions) {
        const permission =
          await this.permissionRepository.findByName(permissionName);
        if (permission) {
          try {
            await this.assignPermissionToRole(ownerRole.id, permission.id);
          } catch (error) {
            // Permission already assigned, continue
          }
        }
      }
    }

    // Property Manager permissions
    const managerRole = await this.roleRepository.findByName(
      Role.PROPERTY_MANAGER,
    );
    const managerPermissions = [
      Permission.VIEW_PROPERTY,
      Permission.VIEW_ROOM,
      Permission.EDIT_ROOM,
      Permission.CREATE_CONTRACT,
      Permission.EDIT_CONTRACT,
      Permission.VIEW_CONTRACT,
      Permission.RECORD_UTILITY_READING,
      Permission.VIEW_MAINTENANCE_REQUEST,
      Permission.ASSIGN_MAINTENANCE_REQUEST,
    ];

    if (managerRole) {
      for (const permissionName of managerPermissions) {
        const permission =
          await this.permissionRepository.findByName(permissionName);
        if (permission) {
          try {
            await this.assignPermissionToRole(managerRole.id, permission.id);
          } catch (error) {
            // Permission already assigned, continue
          }
        }
      }
    }

    // Accountant permissions
    const accountantRole = await this.roleRepository.findByName(
      Role.ACCOUNTANT,
    );
    const accountantPermissions = [
      Permission.CREATE_INVOICE,
      Permission.EDIT_INVOICE,
      Permission.VIEW_INVOICE,
      Permission.RECORD_PAYMENT,
      Permission.VIEW_FINANCIAL_REPORT,
      Permission.VIEW_DEBT_REPORT,
    ];

    if (accountantRole) {
      for (const permissionName of accountantPermissions) {
        const permission =
          await this.permissionRepository.findByName(permissionName);
        if (permission) {
          try {
            await this.assignPermissionToRole(accountantRole.id, permission.id);
          } catch (error) {
            // Permission already assigned, continue
          }
        }
      }
    }

    // Tenant permissions
    const tenantRole = await this.roleRepository.findByName(Role.TENANT);
    const tenantPermissions = [
      Permission.VIEW_OWN_CONTRACT,
      Permission.VIEW_OWN_INVOICE,
      Permission.PAY_INVOICE,
      Permission.CREATE_OWN_MAINTENANCE_REQUEST,
    ];

    if (tenantRole) {
      for (const permissionName of tenantPermissions) {
        const permission =
          await this.permissionRepository.findByName(permissionName);
        if (permission) {
          try {
            await this.assignPermissionToRole(tenantRole.id, permission.id);
          } catch (error) {
            // Permission already assigned, continue
          }
        }
      }
    }
  }
}
