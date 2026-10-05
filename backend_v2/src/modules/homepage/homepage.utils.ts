import { RoomStatus } from 'src/common/enums/room.enum';
import {
  HomepageAlertDto,
  HomepageAlertSeverity,
} from './dto/homepage-alert.dto';
import { HomepageRoomFeedItemDto } from './dto/homepage-room-feed.dto';
import {
  HomepageRevenueDto,
  HomepageRoomStatsDto,
} from './dto/homepage-summary.dto';

/** Số ngày tới để coi hợp đồng là "sắp hết hạn". */
export const CONTRACT_EXPIRING_DAYS = 30;
export const DEFAULT_FEED_LIMIT = 10;
export const DEFAULT_ALERT_LIMIT = 8;

const roundPercent = (value: number) => Math.round(value * 10) / 10;

/** Postgres trả decimal/COUNT dưới dạng string → ép về number an toàn. */
export const toNumber = (value: unknown): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** Định dạng YYYY-MM-DD theo giờ local, khớp với cột kiểu `date`. */
export const toDateOnly = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const addDaysTo = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getMonthRange = (now: Date) => ({
  start: new Date(now.getFullYear(), now.getMonth(), 1),
  nextStart: new Date(now.getFullYear(), now.getMonth() + 1, 1),
});

export const buildRoomStats = (
  rows: { status: string; count: unknown }[],
): HomepageRoomStatsDto => {
  const counts = new Map(rows.map((r) => [r.status, toNumber(r.count)]));
  const get = (status: RoomStatus) => counts.get(status) ?? 0;
  const total = rows.reduce((sum, r) => sum + toNumber(r.count), 0);
  const occupied = get(RoomStatus.OCCUPIED);

  return {
    total,
    occupied,
    available: get(RoomStatus.AVAILABLE),
    maintenance: get(RoomStatus.MAINTENANCE),
    pendingDeposit: get(RoomStatus.PENDING_DEPOSIT),
    unavailable: get(RoomStatus.UNAVAILABLE),
    occupancyRate: total > 0 ? roundPercent((occupied / total) * 100) : 0,
  };
};

export const buildRevenue = (raw?: {
  expected?: unknown;
  collected?: unknown;
  outstanding?: unknown;
}): HomepageRevenueDto => {
  const expected = toNumber(raw?.expected);
  const collected = toNumber(raw?.collected);
  const outstanding = toNumber(raw?.outstanding);
  return {
    expected,
    collected,
    outstanding,
    collectionRate:
      expected > 0
        ? Math.min(100, roundPercent((collected / expected) * 100))
        : 0,
  };
};

/** Phòng cần chú ý nhất lên đầu: quá hạn → nhiều việc tồn → theo tên tài sản/phòng. */
export const sortRoomFeed = (
  items: HomepageRoomFeedItemDto[],
): HomepageRoomFeedItemDto[] =>
  [...items].sort(
    (a, b) =>
      Number(b.hasOverdueAlert) - Number(a.hasOverdueAlert) ||
      b.pendingTaskCount - a.pendingTaskCount ||
      a.propertyName.localeCompare(b.propertyName) ||
      a.roomName.localeCompare(b.roomName),
  );

const SEVERITY_RANK: Record<HomepageAlertSeverity, number> = {
  [HomepageAlertSeverity.CRITICAL]: 0,
  [HomepageAlertSeverity.WARNING]: 1,
  [HomepageAlertSeverity.INFO]: 2,
};

/** Cảnh báo nghiêm trọng nhất lên đầu, cùng mức thì mốc ngày sớm hơn lên trước. */
export const sortAlerts = (items: HomepageAlertDto[]): HomepageAlertDto[] =>
  [...items].sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      a.date.localeCompare(b.date),
  );

/** Số ngày từ `from` tới `to` (chỉ xét phần ngày). Âm = đã qua. */
export const diffInDays = (from: Date, to: Date | string): number => {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const target = typeof to === 'string' ? new Date(`${to}T00:00:00`) : to;
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
};

/** Cột `date` có thể về dưới dạng string hoặc Date tùy driver → chuẩn hóa YYYY-MM-DD. */
export const normalizeDate = (value: Date | string | null | undefined) => {
  if (!value) return '';
  return typeof value === 'string' ? value.slice(0, 10) : toDateOnly(value);
};
