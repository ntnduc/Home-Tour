import { ContractStatus } from 'src/common/enums/contract.enum';
import { RoomStatus } from 'src/common/enums/room.enum';
import {
  isDateRangeOverlapping,
  isRoomRentable,
  resolveCreationOutcome,
  resolvePaymentConfirmedOutcome,
} from './contract-workflow.util';

describe('contract-workflow.util', () => {
  const now = new Date(2026, 8, 10, 15, 0, 0);

  describe('isRoomRentable', () => {
    it.each([
      [RoomStatus.AVAILABLE, true],
      [RoomStatus.OCCUPIED, true],
      [RoomStatus.PENDING_DEPOSIT, true],
      [RoomStatus.MAINTENANCE, false],
      [RoomStatus.UNAVAILABLE, false],
    ])('%s -> %s', (status, expected) => {
      expect(isRoomRentable(status)).toBe(expected);
    });
  });

  describe('isDateRangeOverlapping', () => {
    const existing = { startDate: '2026-01-01', endDate: '2026-06-30' };

    it('allows a new range that starts after a fixed-term contract ends', () => {
      expect(
        isDateRangeOverlapping(existing, {
          startDate: '2026-07-01',
          endDate: '2026-12-31',
        }),
      ).toBe(false);
    });

    it('rejects a range overlapping the end of the existing one (inclusive end)', () => {
      expect(
        isDateRangeOverlapping(existing, { startDate: '2026-06-30' }),
      ).toBe(true);
    });

    it('treats a missing endDate as open-ended (blocks every later date)', () => {
      const openEnded = { startDate: '2026-01-01', endDate: null };
      expect(
        isDateRangeOverlapping(openEnded, { startDate: '2030-01-01' }),
      ).toBe(true);
    });

    it('rejects an open-ended new contract that would swallow a future booking', () => {
      expect(
        isDateRangeOverlapping(
          { startDate: '2026-12-01', endDate: '2027-01-31' },
          { startDate: '2026-09-01' },
        ),
      ).toBe(true);
    });

    it('allows a new range that ends before the existing one starts', () => {
      expect(
        isDateRangeOverlapping(
          { startDate: '2026-12-01', endDate: '2027-01-31' },
          { startDate: '2026-09-01', endDate: '2026-11-30' },
        ),
      ).toBe(false);
    });
  });

  describe('resolveCreationOutcome', () => {
    it('payment required + started -> WAITING_PAYMENT_INVOICE and room PENDING_DEPOSIT', () => {
      expect(
        resolveCreationOutcome({
          startDate: '2026-09-10',
          now,
          requiresPayment: true,
        }),
      ).toEqual({
        contractStatus: ContractStatus.WAITING_PAYMENT_INVOICE,
        roomStatus: RoomStatus.PENDING_DEPOSIT,
      });
    });

    it('payment required + future start -> WAITING_PAYMENT_INVOICE, room untouched', () => {
      expect(
        resolveCreationOutcome({
          startDate: '2026-10-01',
          now,
          requiresPayment: true,
        }),
      ).toEqual({
        contractStatus: ContractStatus.WAITING_PAYMENT_INVOICE,
        roomStatus: undefined,
      });
    });

    it('no invoice + started -> ACTIVE and room OCCUPIED', () => {
      expect(
        resolveCreationOutcome({
          startDate: '2026-09-01',
          now,
          requiresPayment: false,
        }),
      ).toEqual({
        contractStatus: ContractStatus.ACTIVE,
        roomStatus: RoomStatus.OCCUPIED,
      });
    });

    it('no invoice + future start -> PENDING_START, room untouched', () => {
      expect(
        resolveCreationOutcome({
          startDate: '2026-10-01',
          now,
          requiresPayment: false,
        }),
      ).toEqual({ contractStatus: ContractStatus.PENDING_START });
    });
  });

  describe('resolvePaymentConfirmedOutcome', () => {
    it('started -> ACTIVE and room OCCUPIED', () => {
      expect(
        resolvePaymentConfirmedOutcome({ startDate: '2026-09-10', now }),
      ).toEqual({
        contractStatus: ContractStatus.ACTIVE,
        roomStatus: RoomStatus.OCCUPIED,
      });
    });

    it('future start -> PENDING_START until the start date', () => {
      expect(
        resolvePaymentConfirmedOutcome({ startDate: '2026-11-01', now }),
      ).toEqual({ contractStatus: ContractStatus.PENDING_START });
    });
  });
});
