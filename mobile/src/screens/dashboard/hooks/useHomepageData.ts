import {
  getHomepageAlerts,
  getHomepageRoomFeed,
  getHomepageSummary,
} from "@/api/homepage/homepage.api";
import { ApiResponse } from "@/types/api";
import {
  HomepageAlertList,
  HomepageRoomFeedItem,
  HomepageSummary,
} from "@/types/homepage";
import { useFocusEffect } from "@react-navigation/native";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

const ROOM_FEED_LIMIT = 10;
const ALERT_LIMIT = 6;
/** Dữ liệu được coi là "mới" trong 30s → quay lại tab không gọi API thừa. */
const STALE_TIME = 30_000;

export type HomepageSection<T> = {
  data: T | undefined;
  /** Lần tải đầu (chưa có dữ liệu nào) → hiển thị skeleton. */
  isLoading: boolean;
  /** Đang tải lại nền (đổi bộ lọc/focus) → giữ dữ liệu cũ, làm mờ nhẹ. */
  isFetching: boolean;
  isError: boolean;
  retry: () => void;
};

/** Bóc `data` khỏi envelope `{ success, data }`; thiếu data coi là lỗi để UI hiện retry. */
const unwrap = <T>(response: ApiResponse<T>): T => {
  if (response.data === undefined || response.data === null) {
    throw new Error(response.message ?? "Không tải được dữ liệu");
  }
  return response.data;
};

/**
 * Custom hook dữ liệu trang chủ.
 *
 * - Gọi 3 API SONG SONG (`useQueries`) → section nào về trước hiển thị trước,
 *   một section lỗi không làm hỏng các section còn lại.
 * - `propertyId` là bộ lọc tài sản (undefined = tất cả); là một phần của queryKey
 *   nên mỗi bộ lọc được cache riêng, chuyển qua lại tức thì.
 * - `refresh()` dùng cho Pull-to-refresh: refetch cả 3 và trả `isRefreshing`
 *   riêng (không dùng isFetching để spinner không bật khi refetch nền).
 * - Tự refetch khi màn hình được focus lại (bỏ qua lần focus đầu tiên).
 */
export const useHomepageData = () => {
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const filterKey = propertyId ?? "all";

  const [summaryQuery, roomFeedQuery, alertsQuery] = useQueries({
    queries: [
      {
        queryKey: ["homepage", "summary", filterKey],
        queryFn: async (): Promise<HomepageSummary> =>
          unwrap(await getHomepageSummary({ propertyId })),
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["homepage", "room-feed", filterKey],
        queryFn: async (): Promise<HomepageRoomFeedItem[]> =>
          unwrap(
            await getHomepageRoomFeed({ propertyId, limit: ROOM_FEED_LIMIT }),
          ),
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["homepage", "alerts", filterKey],
        queryFn: async (): Promise<HomepageAlertList> =>
          unwrap(await getHomepageAlerts({ propertyId, limit: ALERT_LIMIT })),
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
      },
    ],
  });

  // Giữ refetch mới nhất trong ref để các callback bên dưới ổn định (không tạo lại mỗi render).
  const refetchAllRef = useRef<() => Promise<unknown>>(async () => {});
  refetchAllRef.current = () =>
    Promise.all([
      summaryQuery.refetch(),
      roomFeedQuery.refetch(),
      alertsQuery.refetch(),
    ]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchAllRef.current();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetchAllRef.current();
    }, []),
  );

  const toSection = <T>(query: {
    data: T | undefined;
    isPending: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => unknown;
  }): HomepageSection<T> => ({
    data: query.data,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError && query.data === undefined,
    retry: () => {
      query.refetch();
    },
  });

  return {
    propertyId,
    setPropertyId,
    summary: toSection<HomepageSummary>(summaryQuery),
    roomFeed: toSection<HomepageRoomFeedItem[]>(roomFeedQuery),
    alerts: toSection<HomepageAlertList>(alertsQuery),
    isRefreshing,
    refresh,
  };
};
