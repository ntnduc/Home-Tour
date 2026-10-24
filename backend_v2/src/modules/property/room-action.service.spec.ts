import { InvoiceStatus } from '../../common/enums/invoice.enum';
import { RoomStatus } from '../../common/enums/room.enum';
import {
  RoomActionSeverity,
  RoomActionType,
} from './dto/room-dto/room-action.dto';
import {
  RoomActionService,
  RoomActionSignalInput,
} from './room-action.service';

describe('RoomActionService', () => {
  let service: RoomActionService;

  const now = new Date(2026, 8, 10);

  const buildSignal = (
    overrides: Partial<RoomActionSignalInput> = {},
  ): RoomActionSignalInput => ({
    roomId: 'room-1',
    roomStatus: RoomStatus.AVAILABLE,
    hasAvailableSlot: true,
    overdueInvoiceCount: 0,
    currentPeriodInvoiceExists: false,
    ...overrides,
  });

  const expectSortedAndGrouped = (
    actions: ReturnType<RoomActionService['computeRoomActions']>['actions'],
  ) => {
    expect(actions.map((action) => action.priority)).toEqual(
      [...actions].map((action) => action.priority).sort((a, b) => a - b),
    );
    actions.forEach((action) => {
      expect(action.primary).toBe(action.urgent);
    });
  };

  beforeEach(() => {
    service = new RoomActionService();
  });

  it('returns CREATE_CONTRACT for an empty available room', () => {
    const result = service.computeRoomActions(buildSignal(), now);

    expect(result.actions).toEqual([
      expect.objectContaining({
        type: RoomActionType.CREATE_CONTRACT,
        label: 'Tạo hợp đồng',
        priority: 60,
        urgent: false,
        primary: false,
        severity: RoomActionSeverity.NORMAL,
        payload: { roomId: 'room-1' },
      }),
    ]);
    expect(result.pendingTaskCount).toBe(0);
    expect(result.hasOverdueAlert).toBe(false);
    expectSortedAndGrouped(result.actions);
  });

  it('returns secondary VIEW_CONTRACT and TERMINATE_CONTRACT for an occupied room with active indefinite contract', () => {
    const result = service.computeRoomActions(
      buildSignal({
        roomStatus: RoomStatus.OCCUPIED,
        activeContractId: 'contract-active',
        activeContractStartDate: new Date(2026, 8, 1),
        activePaymentDueDay: 25,
        hasAvailableSlot: false,
      }),
      now,
    );

    expect(result.actions).toEqual([
      expect.objectContaining({
        type: RoomActionType.VIEW_CONTRACT,
        urgent: false,
        primary: false,
        payload: { contractId: 'contract-active', roomId: 'room-1' },
      }),
      expect.objectContaining({
        type: RoomActionType.TERMINATE_CONTRACT,
        urgent: false,
        primary: false,
        payload: { contractId: 'contract-active', roomId: 'room-1' },
      }),
    ]);
    expectSortedAndGrouped(result.actions);
  });

  it('marks overdue invoice payment urgent and raises overdue alert', () => {
    const result = service.computeRoomActions(
      buildSignal({
        roomStatus: RoomStatus.OCCUPIED,
        activeContractId: 'contract-active',
        activeContractStartDate: new Date(2026, 8, 1),
        activePaymentDueDay: 25,
        hasAvailableSlot: false,
        actionableInvoiceId: 'invoice-overdue',
        actionableInvoiceStatus: InvoiceStatus.OVERDUE,
        overdueInvoiceCount: 1,
        currentPeriodInvoiceExists: true,
      }),
      now,
    );

    expect(result.actions[0]).toEqual(
      expect.objectContaining({
        type: RoomActionType.INVOICE_PAYMENT,
        severity: RoomActionSeverity.OVERDUE,
        urgent: true,
        primary: true,
        payload: {
          invoiceId: 'invoice-overdue',
          roomId: 'room-1',
          invoiceStatus: InvoiceStatus.OVERDUE,
        },
      }),
    );
    expect(result.hasOverdueAlert).toBe(true);
    expect(result.overdueAlertMessage).toBe('Hóa đơn quá hạn thanh toán');
    expect(result.pendingTaskCount).toBeGreaterThanOrEqual(1);
    expectSortedAndGrouped(result.actions);
  });

  it('marks missing current-period invoice creation as overdue', () => {
    const result = service.computeRoomActions(
      buildSignal({
        roomStatus: RoomStatus.OCCUPIED,
        activeContractId: 'contract-active',
        activeContractStartDate: new Date(2026, 8, 1),
        activePaymentDueDay: 5,
        hasAvailableSlot: false,
        currentPeriodInvoiceExists: false,
      }),
      now,
    );

    expect(result.actions[0]).toEqual(
      expect.objectContaining({
        type: RoomActionType.CREATE_INVOICE,
        label: 'Tạo hóa đơn',
        priority: 20,
        urgent: true,
        primary: true,
        severity: RoomActionSeverity.OVERDUE,
        payload: { contractId: 'contract-active', roomId: 'room-1' },
      }),
    );
    expect(result.hasOverdueAlert).toBe(true);
    expect(result.overdueAlertMessage).toBe('Chưa tạo hóa đơn kỳ này');
    expectSortedAndGrouped(result.actions);
  });

  it('returns CONFIRM_CONTRACT for a pending contract needing confirmation', () => {
    const result = service.computeRoomActions(
      buildSignal({
        pendingContractId: 'contract-draft',
      }),
      now,
    );

    expect(result.actions).toContainEqual(
      expect.objectContaining({
        type: RoomActionType.CONFIRM_CONTRACT,
        label: 'Xác nhận hợp đồng',
        priority: 30,
        urgent: true,
        primary: true,
        payload: { contractId: 'contract-draft', roomId: 'room-1' },
      }),
    );
    expectSortedAndGrouped(result.actions);
  });

  it('combines invoice payment and contract confirmation as two pending tasks', () => {
    const result = service.computeRoomActions(
      buildSignal({
        pendingContractId: 'contract-pending',
        actionableInvoiceId: 'invoice-pending',
        actionableInvoiceStatus: InvoiceStatus.PENDING,
      }),
      now,
    );

    expect(result.actions.map((action) => action.type)).toEqual([
      RoomActionType.INVOICE_PAYMENT,
      RoomActionType.CONFIRM_CONTRACT,
      RoomActionType.CREATE_CONTRACT,
    ]);
    expect(result.pendingTaskCount).toBe(2);
    expectSortedAndGrouped(result.actions);
  });

  it('currentPeriodInvoiceExists suppresses CREATE_INVOICE and overdue alert', () => {
    const result = service.computeRoomActions(
      buildSignal({
        activeContractId: 'contract-active',
        activeContractStartDate: new Date(2026, 8, 1),
        activePaymentDueDay: 5,
        hasAvailableSlot: false,
        currentPeriodInvoiceExists: true,
      }),
      now,
    );

    expect(result.actions.map((action) => action.type)).not.toContain(
      RoomActionType.CREATE_INVOICE,
    );
    expect(result.hasOverdueAlert).toBe(false);
    expectSortedAndGrouped(result.actions);
  });

  it('waiting-payment contract with no active contract shows only CONFIRM_PAYMENT', () => {
    const result = service.computeRoomActions(
      buildSignal({
        roomStatus: RoomStatus.PENDING_DEPOSIT,
        pendingContractId: 'contract-waiting',
        awaitingPaymentContractId: 'contract-waiting',
        awaitingPaymentInvoiceId: 'invoice-pre',
        actionableInvoiceId: 'invoice-pre',
        actionableInvoiceStatus: InvoiceStatus.DRAFT,
        hasAvailableSlot: true,
      }),
      now,
    );

    expect(result.actions).toEqual([
      expect.objectContaining({
        type: RoomActionType.CONFIRM_PAYMENT,
        label: 'Xác nhận thanh toán',
        urgent: true,
        primary: true,
        payload: {
          contractId: 'contract-waiting',
          invoiceId: 'invoice-pre',
          roomId: 'room-1',
        },
      }),
    ]);
    expect(result.pendingTaskCount).toBe(1);
  });

  it('waiting-payment contract next to an active contract keeps active-contract actions but no duplicate confirm/payment actions', () => {
    const result = service.computeRoomActions(
      buildSignal({
        roomStatus: RoomStatus.OCCUPIED,
        activeContractId: 'contract-active',
        activeContractStartDate: new Date(2026, 8, 1),
        activePaymentDueDay: 25,
        currentPeriodInvoiceExists: true,
        pendingContractId: 'contract-waiting',
        awaitingPaymentContractId: 'contract-waiting',
        awaitingPaymentInvoiceId: 'invoice-pre',
        actionableInvoiceId: 'invoice-pre',
        actionableInvoiceStatus: InvoiceStatus.PENDING,
      }),
      now,
    );

    const types = result.actions.map((action) => action.type);
    expect(types).toContain(RoomActionType.CONFIRM_PAYMENT);
    expect(types).toContain(RoomActionType.VIEW_CONTRACT);
    expect(types).not.toContain(RoomActionType.INVOICE_PAYMENT);
    expect(types).not.toContain(RoomActionType.CONFIRM_CONTRACT);
    expectSortedAndGrouped(result.actions);
  });

  it('PENDING_DEPOSIT room without a waiting contract no longer offers a deposit action', () => {
    const result = service.computeRoomActions(
      buildSignal({ roomStatus: RoomStatus.PENDING_DEPOSIT }),
      now,
    );

    expect(result.actions.map((action) => action.type)).toEqual([
      RoomActionType.CREATE_CONTRACT,
    ]);
  });

  it('hasAvailableSlot = false hides CREATE_CONTRACT (open-ended contract, no end date)', () => {
    const result = service.computeRoomActions(
      buildSignal({ hasAvailableSlot: false }),
      now,
    );

    expect(result.actions).toEqual([]);
    expect(result.pendingTaskCount).toBe(0);
  });

  it('occupied room with a fixed-term contract (free slot after it) still offers CREATE_CONTRACT', () => {
    const result = service.computeRoomActions(
      buildSignal({
        roomStatus: RoomStatus.OCCUPIED,
        activeContractId: 'contract-active',
        activeContractStartDate: new Date(2026, 8, 1),
        activePaymentDueDay: 25,
        currentPeriodInvoiceExists: true,
        hasAvailableSlot: true,
      }),
      now,
    );

    expect(result.actions.map((action) => action.type)).toContain(
      RoomActionType.CREATE_CONTRACT,
    );
  });

  it('missing view row (undefined hasAvailableSlot) hides CREATE_CONTRACT', () => {
    const result = service.computeRoomActions(
      { roomId: 'room-1', roomStatus: RoomStatus.AVAILABLE },
      now,
    );

    expect(result.actions).toEqual([]);
  });
});
