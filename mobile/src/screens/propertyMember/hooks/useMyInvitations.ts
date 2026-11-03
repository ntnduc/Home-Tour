import {
  acceptInvitation,
  declineInvitation,
  getMyInvitations,
} from "@/api/property/propertyMember.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { getMemberErrorMessage } from "../propertyMemberError";

export const MY_INVITATIONS_KEY = ["my-invitations"];

/** Invitee side: pending invitations + accept / decline. */
export const useMyInvitations = () => {
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: MY_INVITATIONS_KEY,
    queryFn: async () => {
      const response = await getMyInvitations();
      if (!response.success || !response.data) {
        throw new Error(response.message ?? "Không tải được lời mời");
      }
      return response.data;
    },
    staleTime: 30_000,
  });

  /** Returns true when the backend accepted the answer. */
  const respond = async (id: string, accept: boolean) => {
    setBusyId(id);
    try {
      const response = accept
        ? await acceptInvitation(id)
        : await declineInvitation(id);
      if (!response.success) {
        Toast.show({ type: "error", text1: "Lỗi", text2: response.message });
        return false;
      }
      await queryClient.invalidateQueries({ queryKey: MY_INVITATIONS_KEY });
      return true;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: getMemberErrorMessage(error),
      });
      return false;
    } finally {
      setBusyId(null);
    }
  };

  return {
    invitations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isRefreshing: query.isRefetching && !query.isLoading,
    refresh: () => query.refetch(),
    respond,
    busyId,
  };
};
