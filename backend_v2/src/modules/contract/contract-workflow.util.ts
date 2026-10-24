import { ContractStatus } from 'src/common/enums/contract.enum';
import { RoomStatus } from 'src/common/enums/room.enum';

type DateLike = Date | string | null | undefined;

/**
 * Room statuses that can still receive a new contract.
 * MAINTENANCE / UNAVAILABLE rooms can never be rented; for the others the
 * time-slot check (no overlapping contract) decides.
 */
export const RENTABLE_ROOM_STATUSES: RoomStatus[] = [
  RoomStatus.AVAILABLE,
  RoomStatus.OCCUPIED,
  RoomStatus.PENDING_DEPOSIT,
];

/** Contract statuses that reserve the room for their date range. */
export const SLOT_BLOCKING_CONTRACT_STATUSES: ContractStatus[] = [
  ContractStatus.DRAFT,
  ContractStatus.PENDING_START,
  ContractStatus.WAITING_PAYMENT_INVOICE,
  ContractStatus.ACTIVE,
];

const startOfDay = (value: Date): Date =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const toDay = (value: DateLike): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
};

export function isRoomRentable(status: string): boolean {
  return RENTABLE_ROOM_STATUSES.includes(status as RoomStatus);
}

/**
 * Two date ranges overlap when each starts on/before the other ends.
 * A null/undefined end date means "no confirmed end date" and is treated as
 * open-ended (it occupies every day after its start). Both bounds are inclusive.
 */
export function isDateRangeOverlapping(
  a: { startDate: DateLike; endDate?: DateLike },
  b: { startDate: DateLike; endDate?: DateLike },
): boolean {
  const aStart = toDay(a.startDate);
  const bStart = toDay(b.startDate);
  if (!aStart || !bStart) return false;
  const aEnd = toDay(a.endDate);
  const bEnd = toDay(b.endDate);

  const aStartsBeforeBEnds = !bEnd || aStart.getTime() <= bEnd.getTime();
  const bStartsBeforeAEnds = !aEnd || bStart.getTime() <= aEnd.getTime();
  return aStartsBeforeBEnds && bStartsBeforeAEnds;
}

export type ContractCreationOutcome = {
  contractStatus: ContractStatus;
  /** Undefined = leave the room status untouched. */
  roomStatus?: RoomStatus;
};

/**
 * Status decision right after a contract is created.
 * - Payment required: contract waits for payment confirmation; the room is only
 *   marked PENDING_DEPOSIT once the contract has started.
 * - No invoice: ACTIVE (room OCCUPIED) when started, otherwise PENDING_START
 *   until the start date.
 */
export function resolveCreationOutcome(params: {
  startDate: DateLike;
  now: Date;
  requiresPayment: boolean;
}): ContractCreationOutcome {
  const started = hasStarted(params.startDate, params.now);
  if (params.requiresPayment) {
    return {
      contractStatus: ContractStatus.WAITING_PAYMENT_INVOICE,
      roomStatus: started ? RoomStatus.PENDING_DEPOSIT : undefined,
    };
  }
  return started
    ? {
        contractStatus: ContractStatus.ACTIVE,
        roomStatus: RoomStatus.OCCUPIED,
      }
    : { contractStatus: ContractStatus.PENDING_START };
}

/** Status decision when the first invoice is confirmed as paid. */
export function resolvePaymentConfirmedOutcome(params: {
  startDate: DateLike;
  now: Date;
}): ContractCreationOutcome {
  return resolveCreationOutcome({ ...params, requiresPayment: false });
}

export function hasStarted(startDate: DateLike, now: Date): boolean {
  const start = toDay(startDate);
  return !!start && start.getTime() <= startOfDay(now).getTime();
}
