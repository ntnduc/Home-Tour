import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAuthenticated } from 'src/common/decorators/allow-anonymous.decorator';
import { Permission, Role } from 'src/common/enums/role.enum';
import { PermissionTreeService } from '../../common/services/permission-tree.service';
import { RequirePermissions } from './decorators/permissions.decorator';
import { Roles } from './decorators/roles.decorator';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UserPermissionsDto, UserRoleDto } from './dto/user-permissions.dto';
import { SetMemberPermissionDto } from './dto/set-member-permission.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { PropertyMemberService } from './property-member.service';
import { RbacService } from './rbac.service';

@ApiTags('RBAC Management')
@ApiBearerAuth()
@Controller('api/rbac')
// Auth/roles/permissions run as global guards (main.ts); do not re-add UseGuards here
export class RbacController {
  constructor(
    private readonly rbacService: RbacService,
    private readonly propertyMemberService: PropertyMemberService,
    private readonly permissionTreeService: PermissionTreeService,
  ) {}

  // Role Management
  @Post('roles')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.CREATE_USER)
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(
      createRoleDto.roleName,
      createRoleDto.description,
    );
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles' })
  @Roles(Role.ADMIN, Role.OWNER)
  async getAllRoles() {
    return this.rbacService.getAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID with permissions' })
  @ApiResponse({ status: 200, description: 'Role details with permissions' })
  @Roles(Role.ADMIN, Role.OWNER)
  async getRoleById(@Param('id') id: string) {
    return this.rbacService.getRoleById(id);
  }

  // Permission Management
  @Post('permissions')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(
      createPermissionDto.permissionName,
      createPermissionDto.description,
    );
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of all permissions' })
  @Roles(Role.ADMIN, Role.OWNER)
  async getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  // Role-Permission Assignment
  @Post('roles/assign-permission')
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiResponse({
    status: 200,
    description: 'Permission assigned to role successfully',
  })
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.ASSIGN_ROLE)
  async assignPermissionToRole(
    @Body() assignPermissionDto: AssignPermissionDto,
  ) {
    await this.rbacService.assignPermissionToRole(
      assignPermissionDto.roleId,
      assignPermissionDto.permissionId,
    );
    return { message: 'Permission assigned to role successfully' };
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiResponse({
    status: 200,
    description: 'Permission removed from role successfully',
  })
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.ASSIGN_ROLE)
  async removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.rbacService.removePermissionFromRole(roleId, permissionId);
    return { message: 'Permission removed from role successfully' };
  }

  // User-Role Assignment
  @Post('users/assign-role')
  @ApiOperation({ summary: 'Assign role to user for a property' })
  @ApiResponse({
    status: 200,
    description: 'Role assigned to user successfully',
  })
  // Authorization is the DB ownership check in PropertyMemberService (not the JWT)
  @AllowAuthenticated()
  async assignUserRole(
    @Request() req: { user: { userId: string } },
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    // Caller must own the target property; role is scoped to that property only
    const userRole = await this.propertyMemberService.setRole(
      req.user.userId,
      assignRoleDto.propertyId,
      assignRoleDto.userId,
      assignRoleDto.roleId,
    );
    return {
      message: 'Role assigned to user successfully',
      userRole,
    };
  }

  @Post('properties/:propertyId/members')
  @ApiOperation({
    summary:
      'Invite a registered user (by phone); stays PENDING until accepted',
  })
  // Authorization is the DB ownership check in PropertyMemberService (not the JWT)
  @AllowAuthenticated()
  async inviteMember(
    @Request() req: { user: { userId: string } },
    @Param('propertyId') propertyId: string,
    @Body() dto: InviteMemberDto,
  ) {
    const invitation = await this.propertyMemberService.invite(
      req.user.userId,
      propertyId,
      dto.phone,
      dto.roleId,
    );
    return { message: 'Đã gửi lời mời', invitation };
  }

  @Put('properties/:propertyId/members/:userId/permissions')
  @ApiOperation({
    summary: 'Enable/disable one permission of an active member',
  })
  // Authorization is the DB ownership check in PropertyMemberService (not the JWT)
  @AllowAuthenticated()
  async setMemberPermission(
    @Request() req: { user: { userId: string } },
    @Param('propertyId') propertyId: string,
    @Param('userId') userId: string,
    @Body() dto: SetMemberPermissionDto,
  ) {
    const permissions = await this.propertyMemberService.setMemberPermission(
      req.user.userId,
      propertyId,
      userId,
      dto.permission,
      dto.granted,
    );
    return { permissions };
  }

  @Delete('properties/:propertyId/invitations/:invitationId')
  @ApiOperation({ summary: 'Cancel a pending invitation' })
  // Authorization is the DB ownership check in PropertyMemberService (not the JWT)
  @AllowAuthenticated()
  async cancelInvitation(
    @Request() req: { user: { userId: string } },
    @Param('propertyId') propertyId: string,
    @Param('invitationId') invitationId: string,
  ) {
    await this.propertyMemberService.cancelInvitation(
      req.user.userId,
      propertyId,
      invitationId,
    );
    return { message: 'Đã hủy lời mời' };
  }

  @Get('permissions/catalog')
  @ApiOperation({ summary: 'Delegable permissions grouped by functional area' })
  // Authorization is the DB ownership check in PropertyMemberService (not the JWT)
  @AllowAuthenticated()
  getPermissionCatalog() {
    return this.propertyMemberService.getPermissionCatalog();
  }

  // Invitee side: any authenticated user (usually has no property yet)
  @Get('invitations/mine')
  @AllowAuthenticated()
  @ApiOperation({ summary: 'My pending property invitations' })
  async myInvitations(@Request() req: { user: { userId: string } }) {
    return this.propertyMemberService.listMyInvitations(req.user.userId);
  }

  @Post('invitations/:invitationId/accept')
  @AllowAuthenticated()
  @ApiOperation({ summary: 'Accept a property invitation' })
  async acceptInvitation(
    @Request() req: { user: { userId: string } },
    @Param('invitationId') invitationId: string,
  ) {
    await this.propertyMemberService.acceptInvitation(
      req.user.userId,
      invitationId,
    );
    return { message: 'Đã chấp nhận lời mời' };
  }

  @Post('invitations/:invitationId/decline')
  @AllowAuthenticated()
  @ApiOperation({ summary: 'Decline a property invitation' })
  async declineInvitation(
    @Request() req: { user: { userId: string } },
    @Param('invitationId') invitationId: string,
  ) {
    await this.propertyMemberService.declineInvitation(
      req.user.userId,
      invitationId,
    );
    return { message: 'Đã từ chối lời mời' };
  }

  @Get('properties/:propertyId/members')
  @ApiOperation({ summary: 'List members and roles of a property' })
  // Authorization is the DB ownership check in PropertyMemberService (not the JWT)
  @AllowAuthenticated()
  async listMembers(
    @Request() req: { user: { userId: string } },
    @Param('propertyId') propertyId: string,
  ) {
    return this.propertyMemberService.listMembers(req.user.userId, propertyId);
  }

  @Delete('users/:userId/roles/:roleId/properties/:propertyId')
  @ApiOperation({ summary: 'Remove role from user for a property' })
  @ApiResponse({
    status: 200,
    description: 'Role removed from user successfully',
  })
  // Authorization is the DB ownership check in PropertyMemberService (not the JWT)
  @AllowAuthenticated()
  async removeUserRole(
    @Request() req: { user: { userId: string } },
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Param('propertyId') propertyId: string,
  ) {
    await this.propertyMemberService.removeMember(
      req.user.userId,
      propertyId,
      userId,
      roleId,
    );
    return { message: 'Role removed from user successfully' };
  }

  // User Permissions and Roles Query
  @Get('users/:userId/roles')
  @ApiOperation({ summary: 'Get all roles for a user' })
  @ApiResponse({
    status: 200,
    description: 'List of user roles',
    type: [UserRoleDto],
  })
  @Roles(Role.ADMIN, Role.OWNER)
  async getUserRoles(@Param('userId') userId: string) {
    const userRoles = await this.rbacService.getUserRoles(userId);
    return userRoles.map((ur) => ({
      userId: ur.userId,
      roleId: ur.roleId,
      roleName: ur.role.roleName,
      propertyId: ur.propertyId,
      propertyName: ur.property?.name || 'Unknown Property',
      assignedDate: ur.assignedDate,
    }));
  }

  @Get('users/:userId/permissions')
  @ApiOperation({ summary: 'Get all permissions for a user' })
  @ApiResponse({
    status: 200,
    description: 'List of user permissions',
    type: UserPermissionsDto,
  })
  async getUserPermissions(
    @Param('userId') userId: string,
    @Query('propertyId') propertyId?: string,
  ) {
    const permissions = await this.rbacService.getUserPermissions(
      userId,
      propertyId,
    );
    return {
      userId,
      propertyId,
      permissions,
    };
  }

  @Get('users/:userId/properties/:propertyId/access')
  @ApiOperation({ summary: 'Check if user has access to a property' })
  @ApiResponse({ status: 200, description: 'Property access status' })
  async checkPropertyAccess(
    @Param('userId') userId: string,
    @Param('propertyId') propertyId: string,
  ) {
    const hasAccess = await this.rbacService.hasPropertyAccess(
      userId,
      propertyId,
    );
    return {
      userId,
      propertyId,
      hasAccess,
    };
  }

  // System Initialization
  @Post('initialize')
  @ApiOperation({ summary: 'Initialize default roles and permissions' })
  @ApiResponse({
    status: 200,
    description: 'Default roles and permissions initialized',
  })
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.MANAGE_SYSTEM)
  async initializeSystem() {
    await this.rbacService.initializeDefaultRolesAndPermissions();
    return {
      message: 'Default roles and permissions initialized successfully',
    };
  }

  // Permission Tree Management
  @Get('permissions/tree')
  @ApiOperation({ summary: 'Get permission tree structure' })
  @ApiResponse({
    status: 200,
    description: 'Permission tree retrieved successfully',
  })
  @Roles(Role.ADMIN, Role.OWNER)
  @RequirePermissions(Permission.VIEW_USER)
  async getPermissionTree() {
    return {
      data: this.permissionTreeService.getPermissionTree(),
      message: 'Permission tree retrieved successfully',
    };
  }

  @Get('permissions/category/:category')
  @ApiOperation({ summary: 'Get permissions by category' })
  @ApiResponse({
    status: 200,
    description: 'Category permissions retrieved successfully',
  })
  @Roles(Role.ADMIN, Role.OWNER)
  @RequirePermissions(Permission.VIEW_USER)
  async getPermissionsByCategory(@Param('category') category: string) {
    const categoryPermissions =
      this.permissionTreeService.getPermissionsByCategory(category);
    return {
      data: categoryPermissions,
      message: `Permissions for category '${category}' retrieved successfully`,
    };
  }

  @Post('permissions/validate')
  @ApiOperation({ summary: 'Validate permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permissions validated successfully',
  })
  @Roles(Role.ADMIN, Role.OWNER)
  @RequirePermissions(Permission.VIEW_USER)
  async validatePermissions(@Body() body: { permissions: string[] }) {
    const result = this.permissionTreeService.validatePermissions(
      body.permissions,
    );
    return {
      data: result,
      message: 'Permissions validated successfully',
    };
  }
}
