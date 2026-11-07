import { privateApi } from "@/services/api";
import { ApiResponse } from "@/types/api";
import {
  InviteMemberRequest,
  MyInvitation,
  PermissionGroup,
  PropertyMember,
  SetMemberPermissionRequest,
} from "@/types/propertyMember";

export const getPropertyMembers = async (propertyId: string) => {
  const response = await privateApi.get<ApiResponse<PropertyMember[]>>(
    `/rbac/properties/${propertyId}/members`,
  );
  return response.data;
};

export const getPermissionCatalog = async () => {
  const response = await privateApi.get<ApiResponse<PermissionGroup[]>>(
    "/rbac/permissions/catalog",
  );
  return response.data;
};

export const invitePropertyMember = async (
  propertyId: string,
  data: InviteMemberRequest,
) => {
  const response = await privateApi.post<ApiResponse<{ message: string }>>(
    `/rbac/properties/${propertyId}/members`,
    data,
  );
  return response.data;
};

export const cancelPropertyInvitation = async (
  propertyId: string,
  invitationId: string,
) => {
  const response = await privateApi.delete<ApiResponse<{ message: string }>>(
    `/rbac/properties/${propertyId}/invitations/${invitationId}`,
  );
  return response.data;
};

export const setMemberPermission = async (
  propertyId: string,
  userId: string,
  data: SetMemberPermissionRequest,
) => {
  const response = await privateApi.put<ApiResponse<{ permissions: string[] }>>(
    `/rbac/properties/${propertyId}/members/${userId}/permissions`,
    data,
  );
  return response.data;
};

export const getMyInvitations = async () => {
  const response = await privateApi.get<ApiResponse<MyInvitation[]>>(
    "/rbac/invitations/mine",
  );
  return response.data;
};

export const acceptInvitation = async (invitationId: string) => {
  const response = await privateApi.post<ApiResponse<{ message: string }>>(
    `/rbac/invitations/${invitationId}/accept`,
  );
  return response.data;
};

export const declineInvitation = async (invitationId: string) => {
  const response = await privateApi.post<ApiResponse<{ message: string }>>(
    `/rbac/invitations/${invitationId}/decline`,
  );
  return response.data;
};
