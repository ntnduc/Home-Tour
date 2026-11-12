import { getContractsByRoom } from "@/api/contract/contract.api";
import { getInvoicesByRoom } from "@/api/invoice/invoice.api";
import { ApiResponse } from "@/types/api";
import { ContractStatus } from "@/types/contract";
import { useQuery } from "@tanstack/react-query";

const STALE_TIME = 30_000;
const LIST_LIMIT = 50;

export const ROOM_HISTORY_KEY = "room-detail-history";
export const ROOM_INVOICES_KEY = "room-detail-invoices";

const unwrap = <T>(response: ApiResponse<T>): T => {
  if (response.data === undefined || response.data === null) {
    throw new Error(response.message ?? "Không tải được dữ liệu");
  }
  return response.data;
};

/** Past contracts of the room; fetched only once `enabled` (section opened). */
export const useRoomHistoryContracts = (roomId: string, enabled: boolean) =>
  useQuery({
    queryKey: [ROOM_HISTORY_KEY, roomId],
    queryFn: async () =>
      unwrap(
        await getContractsByRoom(roomId, {
          limit: LIST_LIMIT,
          offset: 0,
        }),
      ).items.filter((c) => c.status !== ContractStatus.ACTIVE),
    enabled,
    staleTime: STALE_TIME,
  });

/** Invoices of the room; fetched only once `enabled` (section opened). */
export const useRoomInvoices = (roomId: string, enabled: boolean) =>
  useQuery({
    queryKey: [ROOM_INVOICES_KEY, roomId],
    queryFn: async () =>
      unwrap(
        await getInvoicesByRoom(roomId, {
          limit: LIST_LIMIT,
          offset: 0,
        }),
      ).items,
    enabled,
    staleTime: STALE_TIME,
  });
