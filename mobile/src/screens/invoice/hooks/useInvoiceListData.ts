import { getListInvoice } from "@/api/invoice/invoice.api";
import { ApiResponse } from "@/types/api";
import { BasePagingResponse } from "@/types/base.response";
import {
  InvoiceListFilters,
  InvoiceListResponse,
  InvoiceStatus,
} from "@/types/invoice";
import { useFocusEffect } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { buildTimelineRows, toApiDate } from "../invoiceListFormat";

export const INVOICE_PAGE_SIZE = 10;

/** A picked quick filter: id sent to the API + label shown on the chip. */
export interface InvoiceQuickOption {
  id: string;
  label: string;
  /** Contract only: room the contract belongs to. */
  roomId?: string;
}

/** Filters edited in the filter sheet. */
export interface InvoiceAdvancedFilters {
  propertyId: string | null;
  statuses: InvoiceStatus[];
  createdFrom: Date | null;
  createdTo: Date | null;
}

export const EMPTY_ADVANCED_FILTERS: InvoiceAdvancedFilters = {
  propertyId: null,
  statuses: [],
  createdFrom: null,
  createdTo: null,
};

/**
 * Data hook for InvoiceListScreen: filter state, server-side paging (infinite query),
 * pull-to-refresh and refetch on focus (skipping the first focus).
 */
export const useInvoiceListData = (initial?: {
  room?: InvoiceQuickOption;
  contract?: InvoiceQuickOption;
}) => {
  const [search, setSearch] = useState("");
  const [contract, setContract] = useState<InvoiceQuickOption | null>(initial?.contract ?? null);
  const [room, setRoom] = useState<InvoiceQuickOption | null>(initial?.room ?? null);
  const [advanced, setAdvanced] = useState<InvoiceAdvancedFilters>(
    EMPTY_ADVANCED_FILTERS,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFirstFocus = useRef(true);

  const filters = useMemo<InvoiceListFilters>(
    () => ({
      contractId: contract?.id,
      roomId: room?.id,
      propertyId: advanced.propertyId ?? undefined,
      statuses: advanced.statuses.length ? advanced.statuses : undefined,
      createdFrom: advanced.createdFrom ? toApiDate(advanced.createdFrom) : undefined,
      createdTo: advanced.createdTo ? toApiDate(advanced.createdTo) : undefined,
    }),
    [contract, room, advanced],
  );

  const query = useInfiniteQuery<
    ApiResponse<BasePagingResponse<InvoiceListResponse>>,
    Error
  >({
    queryKey: ["invoices", search, filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getListInvoice({
        limit: INVOICE_PAGE_SIZE,
        offset: ((pageParam as number) - 1) * INVOICE_PAGE_SIZE,
        globalKey: search || undefined,
        filters,
      }),
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce(
        (sum, page) => sum + (page.data?.items?.length ?? 0),
        0,
      );
      return loaded < (lastPage.data?.total ?? 0) ? pages.length + 1 : undefined;
    },
  });

  const { refetch } = query;

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetch();
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

  const invoices = useMemo(
    () =>
      (query.data?.pages ?? []).flatMap((page) => page.data?.items ?? []).filter(Boolean),
    [query.data],
  );
  const rows = useMemo(() => buildTimelineRows(invoices), [invoices]);
  const total = query.data?.pages[0]?.data?.total ?? 0;

  /** Picking a room drops a contract that belongs to another room. */
  const selectRoom = useCallback((next: InvoiceQuickOption | null) => {
    setRoom(next);
    setContract((current) =>
      current && next && current.roomId && current.roomId !== next.id ? null : current,
    );
  }, []);

  const advancedCount =
    (advanced.propertyId ? 1 : 0) +
    (advanced.statuses.length ? 1 : 0) +
    (advanced.createdFrom || advanced.createdTo ? 1 : 0);

  return {
    rows,
    invoices,
    total,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch,
    isRefreshing,
    refresh,
    search,
    setSearch,
    contract,
    setContract,
    room,
    selectRoom,
    advanced,
    setAdvanced,
    advancedCount,
    hasActiveFilter: !!(search || contract || room || advancedCount),
  };
};
