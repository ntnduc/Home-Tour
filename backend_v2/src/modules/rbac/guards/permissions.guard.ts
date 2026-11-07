import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, Role } from '../../../common/enums/role.enum';
import { ALLOW_AUTHENTICATED_KEY } from '../../../common/decorators/allow-anonymous.decorator';
import { BaseGuard } from '../../../common/guards/base.guard';
import { PermissionTreeService } from '../../../common/services/permission-tree.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard extends BaseGuard {
  constructor(
    reflector: Reflector,
    private readonly permissionTreeService: PermissionTreeService,
  ) {
    super(reflector);
  }

  protected async canActivateGuard(
    context: ExecutionContext,
  ): Promise<boolean> {
    const allowAuthenticated = this.reflector.getAllAndOverride<boolean>(
      ALLOW_AUTHENTICATED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowAuthenticated) return true;

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    const userProperties = user.properties || [];
    const userPermissions: string[] = [];

    userProperties.forEach((property: any) => {
      if (property.permissions) {
        if (property?.role === Role.ADMIN) {
          // Admin gets all leaf permissions
          userPermissions.push(
            ...this.permissionTreeService.getLeafPermissions(),
          );
        } else {
          userPermissions.push(...property.permissions);
        }
      }
    });

    // Expand user permissions to include child permissions
    const expandedUserPermissions =
      this.permissionTreeService.expandPermissions(userPermissions);

    // Check if user has all required permissions (including inherited ones)
    const isValid = requiredPermissions.every((permission) =>
      this.permissionTreeService.hasPermission(
        expandedUserPermissions,
        permission,
      ),
    );

    return isValid;
  }
}
