import {
  getProfile,
  removeAvatar,
  updateProfile,
  updateProfileSettings,
  uploadAvatar,
} from "@/api/profile/profile.api";
import { ApiResponse } from "@/types/api";
import {
  AvatarFile,
  Profile,
  ProfileSettings,
  ProfileUpdateRequest,
} from "@/types/profile";
import { handleApiError } from "@/utils/apiUtil";
import { storage } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import Toast from "react-native-toast-message";

export const PROFILE_KEY = ["profile"] as const;
const STALE_TIME = 30_000;

/** Unwrap `{ success, data }`; a missing payload is an error so the UI shows retry. */
const unwrap = <T>(response: ApiResponse<T>): T => {
  if (!response.success || response.data === undefined || response.data === null) {
    throw new Error(response.message ?? "Không tải được dữ liệu");
  }
  return response.data;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error && !("response" in error)
    ? error.message
    : handleApiError(error).message;

/** Keep the cached login user (name shown elsewhere) in sync with the profile. */
const syncStoredUser = async (profile: Profile) => {
  try {
    const stored = await storage.getUser();
    await storage.setUser({ ...(stored ?? {}), ...profile });
  } catch {
    // Non-critical: the profile screen reads from the API.
  }
};

/** Shared profile query (same cache entry for Profile screen and dashboard header). */
export const useProfileQuery = () =>
  useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const profile = unwrap(await getProfile());
      await syncStoredUser(profile);
      return profile;
    },
    staleTime: STALE_TIME,
  });

/**
 * Data + actions for the profile area.
 *
 * - `profile` query (stale 30s, refetch on focus except the first).
 * - Mutations show a Toast on success/error and write the fresh profile into the cache.
 * - Settings toggles are optimistic and roll back on failure.
 */
export const useProfileData = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const query = useProfileQuery();

  const isFirstFocus = useRef(true);
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      void refetch();
    }, [refetch]),
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const applyProfile = useCallback(
    (profile: Profile) => {
      queryClient.setQueryData(PROFILE_KEY, profile);
      void syncStoredUser(profile);
    },
    [queryClient],
  );

  const updateMutation = useMutation({
    mutationFn: async (body: ProfileUpdateRequest) => unwrap(await updateProfile(body)),
    onSuccess: (profile) => {
      applyProfile(profile);
      Toast.show({ type: "success", text1: "Đã cập nhật thông tin" });
    },
    onError: (error) =>
      Toast.show({ type: "error", text1: "Cập nhật thất bại", text2: errorMessage(error) }),
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: AvatarFile) => unwrap(await uploadAvatar(file)),
    onSuccess: (profile) => {
      applyProfile(profile);
      Toast.show({ type: "success", text1: "Đã cập nhật ảnh đại diện" });
    },
    onError: (error) =>
      Toast.show({ type: "error", text1: "Không tải được ảnh", text2: errorMessage(error) }),
  });

  const removeAvatarMutation = useMutation({
    mutationFn: async () => unwrap(await removeAvatar()),
    onSuccess: (profile) => {
      applyProfile(profile);
      Toast.show({ type: "success", text1: "Đã xóa ảnh đại diện" });
    },
    onError: (error) =>
      Toast.show({ type: "error", text1: "Không xóa được ảnh", text2: errorMessage(error) }),
  });

  const settingsMutation = useMutation({
    mutationFn: async (patch: Partial<ProfileSettings>) =>
      unwrap(await updateProfileSettings(patch)),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_KEY });
      const previous = queryClient.getQueryData<Profile>(PROFILE_KEY);
      if (previous) {
        queryClient.setQueryData<Profile>(PROFILE_KEY, {
          ...previous,
          settings: { ...previous.settings, ...patch },
        });
      }
      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(PROFILE_KEY, context.previous);
      Toast.show({ type: "error", text1: "Lưu cài đặt thất bại", text2: errorMessage(error) });
    },
    onSuccess: (settings) => {
      const current = queryClient.getQueryData<Profile>(PROFILE_KEY);
      if (current) queryClient.setQueryData<Profile>(PROFILE_KEY, { ...current, settings });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError && !query.data,
    isRefreshing,
    refresh,
    retry: () => void refetch(),
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    uploadAvatar: avatarMutation.mutateAsync,
    isUploadingAvatar: avatarMutation.isPending,
    removeAvatar: removeAvatarMutation.mutateAsync,
    isRemovingAvatar: removeAvatarMutation.isPending,
    updateSettings: settingsMutation.mutate,
  };
};
