export type PropertyMemberStatus = "ACTIVE" | "PENDING";

export interface PropertyMember {
  status: PropertyMemberStatus;
  userId: string;
  fullName: string;
  phone: string;
  roleId: string;
  roleName: string;
  isOwner: boolean;
  /** Set only for PENDING members. */
  invitationId?: string;
  /** Effective permissions (role + per-member switches); empty while pending. */
  permissions: string[];
  since: string;
}

export interface PermissionGroup {
  /** Functional area key, e.g. "ROOM". */
  group: string;
  /** Permission ids, e.g. "ROOM.EDIT". */
  permissions: string[];
}

export interface InviteMemberRequest {
  phone: string;
  roleId?: string;
}

export interface SetMemberPermissionRequest {
  permission: string;
  granted: boolean;
}

export interface MyInvitation {
  id: string;
  propertyId: string;
  propertyName: string;
  invitedByName: string;
  roleName: string;
  createdAt: string;
}
