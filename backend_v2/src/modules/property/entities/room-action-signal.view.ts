import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({ name: 'vw_room_action_signals' })
export class RoomActionSignal {
  @ViewColumn()
  roomId: string;

  @ViewColumn()
  roomStatus: string;

  @ViewColumn()
  activeContractId?: string | null;

  @ViewColumn()
  activeContractStartDate?: Date | null;

  @ViewColumn()
  activePaymentDueDay?: number | null;

  @ViewColumn()
  pendingContractId?: string | null;

  @ViewColumn()
  awaitingDepositContractId?: string | null;

  @ViewColumn()
  expiredContractId?: string | null;

  @ViewColumn()
  hasIndefiniteActiveContract: boolean;

  @ViewColumn()
  actionableInvoiceId?: string | null;

  @ViewColumn()
  actionableInvoiceStatus?: string | null;

  @ViewColumn()
  overdueInvoiceCount: number;

  @ViewColumn()
  currentPeriodInvoiceExists: boolean;
}
