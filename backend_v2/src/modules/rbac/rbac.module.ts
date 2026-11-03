import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Properties } from '../property/entities/properties.entity';
import { User } from '../users/entities/user.entity';
import { PermissionTreeService } from '../../common/services/permission-tree.service';
import { PermissionEntity } from './entities/permission.entity';
import { PropertyInvitation } from './entities/property-invitation.entity';
import { PropertyMemberPermission } from './entities/property-member-permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { PropertyAccessGuard } from './guards/property-access.guard';
import { RolesGuard } from './guards/roles.guard';
import { PropertyMemberService } from './property-member.service';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRoleRepository } from './repositories/user-role.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      PermissionEntity,
      RolePermission,
      UserRole,
      User,
      Properties,
      PropertyInvitation,
      PropertyMemberPermission,
    ]),
  ],
  controllers: [RbacController],
  providers: [
    RbacService,
    PropertyMemberService,
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
    PermissionTreeService,
    RolesGuard,
    PermissionsGuard,
    PropertyAccessGuard,
  ],
  exports: [
    RbacService,
    PropertyMemberService,
    PermissionTreeService,
    RolesGuard,
    PermissionsGuard,
    PropertyAccessGuard,
  ],
})
export class RbacModule {}
