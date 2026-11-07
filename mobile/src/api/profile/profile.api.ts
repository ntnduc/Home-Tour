import { filePrivateApi, privateApi } from "@/services/api";
import { ApiResponse } from "@/types/api";
import {
  AvatarFile,
  Profile,
  ProfileSettings,
  ProfileUpdateRequest,
} from "@/types/profile";

/** Profile of the authenticated user (id comes from the token, never from the client). */
export const getProfile = async (): Promise<ApiResponse<Profile>> => {
  const response = await privateApi.get<ApiResponse<Profile>>("/profile");
  return response.data;
};

export const updateProfile = async (
  body: ProfileUpdateRequest,
): Promise<ApiResponse<Profile>> => {
  const response = await privateApi.put<ApiResponse<Profile>>("/profile", body);
  return response.data;
};

export const uploadAvatar = async (
  file: AvatarFile,
): Promise<ApiResponse<Profile>> => {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  const response = await filePrivateApi.post<ApiResponse<Profile>>(
    "/profile/avatar",
    formData,
  );
  return response.data;
};

export const removeAvatar = async (): Promise<ApiResponse<Profile>> => {
  const response = await privateApi.delete<ApiResponse<Profile>>("/profile/avatar");
  return response.data;
};

export const updateProfileSettings = async (
  body: Partial<ProfileSettings>,
): Promise<ApiResponse<ProfileSettings>> => {
  const response = await privateApi.put<ApiResponse<ProfileSettings>>(
    "/profile/settings",
    body,
  );
  return response.data;
};
