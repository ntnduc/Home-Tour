export enum RoomActionType {
  INVOICE_PAYMENT = 'INVOICE_PAYMENT',
  CREATE_INVOICE = 'CREATE_INVOICE',
  CONFIRM_CONTRACT = 'CONFIRM_CONTRACT',
  CONFIRM_DEPOSIT = 'CONFIRM_DEPOSIT',
  RENEW_CONTRACT = 'RENEW_CONTRACT',
  CREATE_CONTRACT = 'CREATE_CONTRACT',
  VIEW_CONTRACT = 'VIEW_CONTRACT',
  TERMINATE_CONTRACT = 'TERMINATE_CONTRACT',
}

export enum RoomActionSeverity {
  NORMAL = 'normal',
  WARNING = 'warning',
  OVERDUE = 'overdue',
}

export type RoomActionPayload = {
  contractId?: string;
  invoiceId?: string;
  roomId?: string;
  invoiceStatus?: string;
};

export class RoomActionDto {
  type: RoomActionType;
  label: string;
  priority: number;
  urgent: boolean;
  primary: boolean;
  severity: RoomActionSeverity;
  payload: RoomActionPayload;
}

export const ROOM_ACTION_CONFIG: Record<
  RoomActionType,
  Pick<RoomActionDto, 'label' | 'priority' | 'urgent' | 'primary'>
> = {
  [RoomActionType.INVOICE_PAYMENT]: {
    label: 'Xử lý hóa đơn',
    priority: 10,
    urgent: true,
    primary: true,
  },
  [RoomActionType.CREATE_INVOICE]: {
    label: 'Tạo hóa đơn',
    priority: 20,
    urgent: true,
    primary: true,
  },
  [RoomActionType.CONFIRM_CONTRACT]: {
    label: 'Xác nhận hợp đồng',
    priority: 30,
    urgent: true,
    primary: true,
  },
  [RoomActionType.CONFIRM_DEPOSIT]: {
    label: 'Xác nhận đặt cọc',
    priority: 40,
    urgent: true,
    primary: true,
  },
  [RoomActionType.RENEW_CONTRACT]: {
    label: 'Gia hạn hợp đồng',
    priority: 50,
    urgent: true,
    primary: true,
  },
  [RoomActionType.CREATE_CONTRACT]: {
    label: 'Tạo hợp đồng',
    priority: 60,
    urgent: false,
    primary: false,
  },
  [RoomActionType.VIEW_CONTRACT]: {
    label: 'Xem hợp đồng',
    priority: 70,
    urgent: false,
    primary: false,
  },
  [RoomActionType.TERMINATE_CONTRACT]: {
    label: 'Thanh lý hợp đồng',
    priority: 80,
    urgent: false,
    primary: false,
  },
};
