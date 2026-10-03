import { Injectable } from '@nestjs/common';
import { InvoiceStatus } from 'src/common/enums/invoice.enum';
import { RoomStatus } from 'src/common/enums/room.enum';
import { getCurrentDate } from 'src/common/utils';
import {
  ROOM_ACTION_CONFIG,
  RoomActionDto,
  RoomActionSeverity,
  RoomActionType,
} from './dto/room-dto/room-action.dto';
import { RoomActionSignal } from './entities/room-action-signal.view';

type DateLike = Date | string | null | undefined;

export type RoomActionSignalInput = Partial<RoomActionSignal> & {
  roomId: string;
  roomStatus?: string;
};

export type RoomActionComputationResult = {
  actions: RoomActionDto[];
  pendingTaskCount: number;
  hasOverdueAlert: boolean;
  overdueAlertMessage?: string;
};

type InvoiceCreationInfo = {
  due: boolean;
  overdue: boolean;
};

@Injectable()
export class RoomActionService {
  computeRoomActions(
    signal: RoomActionSignalInput,
    now: Date = getCurrentDate(),
  ): RoomActionComputationResult {
    const actions: RoomActionDto[] = [];
    const invoiceCreationInfo = this.getInvoiceCreationInfo(signal, now);

    if (signal.actionableInvoiceId) {
      actions.push(
        this.createAction(RoomActionType.INVOICE_PAYMENT, {
          severity:
            signal.actionableInvoiceStatus === InvoiceStatus.OVERDUE
              ? RoomActionSeverity.OVERDUE
              : RoomActionSeverity.NORMAL,
          payload: {
            invoiceId: signal.actionableInvoiceId,
            roomId: signal.roomId,
            invoiceStatus: signal.actionableInvoiceStatus ?? undefined,
          },
        }),
      );
    }

    if (invoiceCreationInfo.due) {
      actions.push(
        this.createAction(RoomActionType.CREATE_INVOICE, {
          severity: invoiceCreationInfo.overdue
            ? RoomActionSeverity.OVERDUE
            : RoomActionSeverity.WARNING,
          payload: {
            contractId: signal.activeContractId ?? undefined,
            roomId: signal.roomId,
          },
        }),
      );
    }

    if (signal.pendingContractId) {
      actions.push(
        this.createAction(RoomActionType.CONFIRM_CONTRACT, {
          payload: {
            contractId: signal.pendingContractId,
            roomId: signal.roomId,
          },
        }),
      );
    }

    if (
      signal.roomStatus === RoomStatus.PENDING_DEPOSIT ||
      signal.awaitingDepositContractId
    ) {
      actions.push(
        this.createAction(RoomActionType.CONFIRM_DEPOSIT, {
          payload: {
            contractId:
              signal.awaitingDepositContractId ??
              signal.pendingContractId ??
              undefined,
            roomId: signal.roomId,
          },
        }),
      );
    }

    if (signal.expiredContractId) {
      actions.push(
        this.createAction(RoomActionType.RENEW_CONTRACT, {
          payload: {
            contractId: signal.expiredContractId,
            roomId: signal.roomId,
          },
        }),
      );
    }

    if (signal.hasIndefiniteActiveContract === false) {
      actions.push(
        this.createAction(RoomActionType.CREATE_CONTRACT, {
          payload: { roomId: signal.roomId },
        }),
      );
    }

    if (signal.activeContractId) {
      actions.push(
        this.createAction(RoomActionType.VIEW_CONTRACT, {
          payload: {
            contractId: signal.activeContractId,
            roomId: signal.roomId,
          },
        }),
      );
      actions.push(
        this.createAction(RoomActionType.TERMINATE_CONTRACT, {
          payload: {
            contractId: signal.activeContractId,
            roomId: signal.roomId,
          },
        }),
      );
    }

    actions.sort((a, b) => a.priority - b.priority);

    const overdueInvoiceCount = Number(signal.overdueInvoiceCount ?? 0);
    const hasOverdueAlert = overdueInvoiceCount > 0 || invoiceCreationInfo.due;

    return {
      actions,
      pendingTaskCount: actions.filter((action) => action.urgent).length,
      hasOverdueAlert,
      overdueAlertMessage:
        overdueInvoiceCount > 0
          ? 'Hóa đơn quá hạn thanh toán'
          : invoiceCreationInfo.due
            ? 'Chưa tạo hóa đơn kỳ này'
            : undefined,
    };
  }

  getInvoiceCreationDate(now: Date, paymentDueDay?: number | null): Date {
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const day = Math.min(
      Math.max(Number(paymentDueDay ?? 1), 1),
      lastDayOfMonth,
    );
    return this.startOfDay(new Date(now.getFullYear(), now.getMonth(), day));
  }

  private getInvoiceCreationInfo(
    signal: RoomActionSignalInput,
    now: Date,
  ): InvoiceCreationInfo {
    const activeContractStartDate = this.toDate(signal.activeContractStartDate);
    const today = this.startOfDay(now);

    if (
      !signal.activeContractId ||
      !activeContractStartDate ||
      this.startOfDay(activeContractStartDate).getTime() > today.getTime() ||
      signal.currentPeriodInvoiceExists
    ) {
      return { due: false, overdue: false };
    }

    const creationDate = this.getInvoiceCreationDate(
      now,
      signal.activePaymentDueDay,
    );
    const todayTime = today.getTime();
    const creationTime = creationDate.getTime();

    return {
      due: todayTime >= creationTime,
      overdue: todayTime > creationTime,
    };
  }

  private createAction(
    type: RoomActionType,
    overrides: {
      payload: RoomActionDto['payload'];
      severity?: RoomActionSeverity;
    },
  ): RoomActionDto {
    const config = ROOM_ACTION_CONFIG[type];
    return {
      type,
      ...config,
      severity: overrides.severity ?? RoomActionSeverity.NORMAL,
      payload: overrides.payload,
    };
  }

  private toDate(value: DateLike): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  private startOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
}
