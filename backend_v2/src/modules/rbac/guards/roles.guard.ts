import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../common/enums/role.enum';
import { ALLOW_AUTHENTICATED_KEY } from '../../../common/decorators/allow-anonymous.decorator';
import { BaseGuard } from '../../../common/guards/base.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard extends BaseGuard {
  constructor(reflector: Reflector) {
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

    const requiredRoles = this.reflector?.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    const userProperties = user.properties || [];
    const userRoles = userProperties.map((property: any) => property.role);

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
