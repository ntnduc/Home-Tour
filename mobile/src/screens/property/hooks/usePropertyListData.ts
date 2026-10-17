/**
 * Data hook for PropertyListScreen — infinite pagination + search + refresh.
 *
 * Manages:
 * - Infinite query with debounced search
 * - Proper pagination via `getNextPageParam` (compare items loaded vs total)
 * - Pull-to-refresh with separate `isRefreshing` state
 * - Focus refetch (skipping first focus)
 */

import { getListProperty } from "@/api/property/property.api";
import { ApiResponse } from "@/types/api";
import { BasePagingResponse } from "@/types/base.response";
import { PropertyListResponse } from "@/types/property";
import { useFocusEffect } from "@react-navigation/native";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const PAGE_SIZE = 10;

export interface PropertyListData {
  /** Trimmed search query (source of queryKey). */
  search: string;
  setSearch: (value: string) => void;

  /** Flattened array of all loaded properties. */
  properties: PropertyListResponse[];
  /** Total count from API (not just loaded count). */
  total: number;

  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  retry: () => void;

  isRefreshing: boolean;
  refresh: () => Promise<void>;

  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
}

/**
 * Hook for PropertyListScreen data.
 *
 * Query key: `["properties", "list", searchKey]` where searchKey = search.trim() || "all".
 * This preserves the `"properties"` prefix so other code's `invalidateQueries(["properties"])`
 * still works.
 *
 * Pagination:
 * - `PAGE_SIZE = 10`
 * - request for page `n`: `limit: 10`, `offset: (n-1)*10`
 * - `getNextPageParam`: compares **items loaded** to API `total`
 *   - returns next page number if `itemsLoaded < total && lastPage had ≥1 item`
 *   - returns `undefined` on last page (stops requests forever)
 *
 * Refetch on focus: skips the first focus to avoid unnecessary reload on mount.
 */
export const usePropertyListData = (): PropertyListData => {
  const [searchInput, setSearchInput] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const firstFocusRef = useRef(true);

  const searchKey = searchInput.trim() || "all";
  const trimmedSearch = searchInput.trim();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<
    ApiResponse<BasePagingResponse<PropertyListResponse>>,
    Error
  >({
    queryKey: ["properties", "list", searchKey],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getListProperty({
        limit: PAGE_SIZE,
        offset: ((pageParam as number) - 1) * PAGE_SIZE,
        globalKey: trimmedSearch || undefined,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const itemsLoaded = allPages.reduce(
        (sum, page) => sum + (page.data?.items?.length ?? 0),
        0,
      );
      const total = lastPage.data?.total ?? 0;
      const lastPageHasItems = (lastPage.data?.items?.length ?? 0) > 0;

      if (itemsLoaded < total && lastPageHasItems) {
        return allPages.length + 1;
      }
      return undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const properties =
    data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];
  const total =
    data?.pages[data.pages.length - 1]?.data?.total ?? properties.length;

  const handleSetSearch = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  // Refetch on focus, skipping first focus (on mount)
  useFocusEffect(
    useCallback(() => {
      if (firstFocusRef.current) {
        firstFocusRef.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );

  return {
    search: searchInput,
    setSearch: handleSetSearch,
    properties,
    total,
    isLoading,
    isFetching,
    isError,
    retry: handleRetry,
    isRefreshing,
    refresh: handleRefresh,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore: handleLoadMore,
  };
};
