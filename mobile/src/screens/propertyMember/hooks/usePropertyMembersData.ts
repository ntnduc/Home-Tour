import {
  cancelPropertyInvitation,
  getPermissionCatalog,
  getPropertyMembers,
  invitePropertyMember,
  setMemberPermission,
} from "@/api/property/propertyMember.api";
import { ApiResponse } from "@/types/api";
import { PermissionGroup, PropertyMember } from "@/types/propertyMember";
import { useFocusEffect } from "@react-navigation/native";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { getMemberErrorMessage } from "../propertyMemberError";
import { sortGroups } from "../propertyMemberLabels";

const unwrap = <T>(response: ApiResponse<T>): T => {
  if (!response.success || response.data === undefined) {
    throw new Error(response.message ?? "Không tải được dữ liệu");
  }
  return response.data;
};

const toastError = (error: unknown) =>
  Toast.show({
    type: "error",
    text1: "Lỗi",
    text2: getMemberErrorMessage(error),
  });

/**
 * Data layer for PropertyMembersScreen: members (+ pending invitations),
 * the permission catalog, and the invite / cancel / toggle mutations.
 */
export const usePropertyMembersData = (propertyId: string) => {
  const queryClient = useQueryClient();
  const membersKey = ["property-members", propertyId];

  const membersQuery = useQuery({
    queryKey: membersKey,
    queryFn: async () => unwrap(await getPropertyMembers(propertyId)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const catalogQuery = useQuery({
    queryKey: ["permission-catalog"],
    queryFn: async () => sortGroups(unwrap(await getPermissionCatalog())),
    staleTime: 10 * 60_000,
  });

  // Refetch on focus, skipping the first focus (the queries just ran)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      membersQuery.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // "userId:permission" keys currently being saved (switch shows disabled)
  const [savingKeys, setSavingKeys] = useState<string[]>([]);

  const toggleMutation = useMutation({
    mutationFn: (v: { userId: string; permission: string; granted: boolean }) =>
      setMemberPermission(propertyId, v.userId, {
        permission: v.permission,
        granted: v.granted,
      }),
    onMutate: (v) =>
      setSavingKeys((k) => [...k, `${v.userId}:${v.permission}`]),
    onSuccess: (response, v) => {
      if (!response.success || !response.data) {
        Toast.show({ type: "error", text1: "Lỗi", text2: response.message });
        return;
      }
      const permissions = response.data.permissions;
      queryClient.setQueryData<PropertyMember[]>(membersKey, (old) =>
        old?.map((m) =>
          m.userId === v.userId && m.status === "ACTIVE"
            ? { ...m, permissions }
            : m,
        ),
      );
    },
    onError: toastError,
    onSettled: (_data, _error, v) =>
      setSavingKeys((k) =>
        k.filter((key) => key !== `${v.userId}:${v.permission}`),
      ),
  });

  const inviteMutation = useMutation({
    mutationFn: (phone: string) => invitePropertyMember(propertyId, { phone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey });
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã gửi lời mời, đang chờ người dùng chấp nhận",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (invitationId: string) =>
      cancelPropertyInvitation(propertyId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey });
      Toast.show({ type: "success", text1: "Đã hủy lời mời" });
    },
    onError: toastError,
  });

  const groups: PermissionGroup[] = catalogQuery.data ?? [];

  return {
    members: membersQuery.data ?? [],
    groups,
    isLoading: membersQuery.isLoading || catalogQuery.isLoading,
    isError: membersQuery.isError || catalogQuery.isError,
    isRefreshing: membersQuery.isRefetching && !membersQuery.isLoading,
    refresh: () => {
      membersQuery.refetch();
      catalogQuery.refetch();
    },
    isSaving: (userId: string, permission: string) =>
      savingKeys.includes(`${userId}:${permission}`),
    togglePermission: (userId: string, permission: string, granted: boolean) =>
      toggleMutation.mutate({ userId, permission, granted }),
    /** Rejects with the backend's Vietnamese message so the sheet can show it inline. */
    invite: async (phone: string) => {
      try {
        const response = await inviteMutation.mutateAsync(phone);
        if (!response.success) throw new Error(response.message);
      } catch (error) {
        throw new Error(getMemberErrorMessage(error));
      }
    },
    cancelInvitation: (invitationId: string) =>
      cancelMutation.mutate(invitationId),
    isCancelling: cancelMutation.isPending,
  };
};
