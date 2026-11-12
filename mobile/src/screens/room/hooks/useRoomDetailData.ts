import { getContractsByRoom } from "@/api/contract/contract.api";
import { getRoom } from "@/api/room/room.api";
import { getFilesCollection } from "@/components/Uploadfile/uploadfile.api";
import { ApiResponse } from "@/types/api";
import { ContractListResponse, ContractStatus } from "@/types/contract";
import { RoomDetailResponse } from "@/types/room";
import { useFocusEffect } from "@react-navigation/native";
import { keepPreviousData, useQueries, useQueryClient } from "@tanstack/react-query";
import { ROOM_HISTORY_KEY, ROOM_INVOICES_KEY } from "./useRoomLazyLists";
import { useCallback, useRef, useState } from "react";

const STALE_TIME = 30_000;
const CONTRACT_LIMIT = 1;

export type RoomDetailSection<T> = {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  retry: () => void;
};

/** Unwrap the `{ success, data }` envelope; missing data is treated as an error. */
const unwrap = <T>(response: ApiResponse<T>): T => {
  if (response.data === undefined || response.data === null) {
    throw new Error(response.message ?? "Không tải được dữ liệu");
  }
  return response.data;
};

/**
 * Data for the room detail screen: room, its contracts and its image URLs,
 * fetched in parallel so one failing section never blocks the others.
 */
export const useRoomDetailData = (roomId: string) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFirstFocus = useRef(true);

  const [roomQuery, contractsQuery] = useQueries({
    queries: [
      {
        queryKey: ["room-detail", "info", roomId],
        queryFn: async () => unwrap(await getRoom(roomId)),
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["room-detail", "contracts", roomId],
        queryFn: async () =>
          unwrap(
            await getContractsByRoom(roomId, {
              limit: CONTRACT_LIMIT,
              offset: 0,
              // Only the active contract here; history loads lazily
              filters: { status: ContractStatus.ACTIVE },
            }),
          ).items,
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
      },
    ],
  });

  const imageCollectionId = roomQuery.data?.imageCollectionId;
  const [imagesQuery] = useQueries({
    queries: [
      {
        queryKey: ["room-detail", "images", imageCollectionId],
        queryFn: async () => {
          const collection = await getFilesCollection(imageCollectionId as string);
          return (collection?.files ?? []).filter((file) => !file.isDeleted);
        },
        enabled: !!imageCollectionId,
        staleTime: STALE_TIME,
      },
    ],
  });

  const refetchAll = useCallback(async () => {
    await Promise.all([
      roomQuery.refetch(),
      contractsQuery.refetch(),
      imagesQuery.refetch(),
      // Refetches only lazy sections already opened (inactive ones just go stale)
      queryClient.invalidateQueries({ queryKey: [ROOM_HISTORY_KEY, roomId] }),
      queryClient.invalidateQueries({ queryKey: [ROOM_INVOICES_KEY, roomId] }),
    ]);
  }, [roomQuery, contractsQuery, imagesQuery, queryClient, roomId]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      roomQuery.refetch();
      contractsQuery.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchAll]);

  const toSection = <T,>(
    query: {
      data: T | undefined;
      isLoading: boolean;
      isFetching: boolean;
      isError: boolean;
      refetch: () => unknown;
    },
  ): RoomDetailSection<T> => ({
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    retry: () => {
      query.refetch();
    },
  });

  return {
    room: toSection<RoomDetailResponse>(roomQuery),
    contracts: toSection<ContractListResponse[]>(contractsQuery),
    images: toSection(imagesQuery),
    isRefreshing,
    refresh,
  };
};
