import { StatusOption } from "@/components/Status";
import { StatusBadgeSpec } from "@/theme";
import { RoomStatus } from "@/types/room";

/** Single source of truth: room status → badge label + tone (matches the Dashboard). */
export const ROOM_STATUS_BADGE: Record<RoomStatus, StatusBadgeSpec> = {
  [RoomStatus.AVAILABLE]: { label: "Trống", tone: "info" },
  [RoomStatus.OCCUPIED]: { label: "Đang thuê", tone: "success" },
  [RoomStatus.MAINTENANCE]: { label: "Đang sửa", tone: "warning" },
  [RoomStatus.PENDING_DEPOSIT]: { label: "Chờ đặt cọc", tone: "warning" },
  [RoomStatus.UNAVAILABLE]: { label: "Không hoạt động", tone: "cancelled" },
};

/** Statuses a landlord can pick manually (PENDING_DEPOSIT is system-driven). */
export const ROOM_STATUS_OPTIONS: StatusOption[] = [
  RoomStatus.AVAILABLE,
  RoomStatus.OCCUPIED,
  RoomStatus.MAINTENANCE,
  RoomStatus.UNAVAILABLE,
].map((status) => ({
  value: status,
  label: ROOM_STATUS_BADGE[status].label,
  type: ROOM_STATUS_BADGE[status].tone,
}));
