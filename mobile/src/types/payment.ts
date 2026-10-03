export interface Payment {
  id: string;
  invoiceId?: string;
  paymentDate: Date;
  amount: number;
  propertyId: string;
  type: PaymentType;
  paymentMethod?: string;
  status: PaymentStatus;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentCreateRequest extends Omit<
  Payment,
  "id" | "createdAt" | "updatedAt" | "invoiceId"
> {
  roomName: string;
  isCarryOver?: boolean;
  invoiceId: string;
  contractId: string;
  remainingAmount: number;
}

export interface PaymentUpdateRequest extends Omit<
  Payment,
  "id" | "createdAt" | "updatedAt"
> {}

export interface PaymentDetailResponse extends Payment {}

export interface PaymentListResponse extends Payment {}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
  DRAFT = "DRAFT",
}

export enum PaymentType {
  IN = "IN",
  OUT = "OUT",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  MOBILE_BANKING = "MOBILE_BANKING",
  CREDIT_CARD = "CREDIT_CARD",
  OTHER = "OTHER",
}

export enum PaymentFor {
  INVOICE = "INVOICE",
  DEPOSIT = "DEPOSIT",
  RENT = "RENT",
  SERVICE = "SERVICE",
  OTHER = "OTHER",
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Chờ thanh toán",
  [PaymentStatus.PAID]: "Đã thanh toán",
  [PaymentStatus.OVERDUE]: "Quá hạn",
  [PaymentStatus.CANCELLED]: "Đã hủy",
  [PaymentStatus.PARTIALLY_PAID]: "Thanh toán một phần",
  [PaymentStatus.DRAFT]: "Nháp",
};

export const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  [PaymentType.IN]: "Tiền thuê",
  [PaymentType.OUT]: "Chi",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Tiền mặt",
  [PaymentMethod.BANK_TRANSFER]: "Chuyển khoản",
  [PaymentMethod.MOBILE_BANKING]: "Mobile Banking",
  [PaymentMethod.CREDIT_CARD]: "Thẻ tín dụng",
  [PaymentMethod.OTHER]: "Khác",
};

export const PAYMENT_FOR_LABEL: Record<PaymentFor, string> = {
  [PaymentFor.INVOICE]: "Hóa đơn",
  [PaymentFor.DEPOSIT]: "Tiền cọc",
  [PaymentFor.RENT]: "Tiền thuê",
  [PaymentFor.SERVICE]: "Dịch vụ",
  [PaymentFor.OTHER]: "Khác",
};

export const PAYMENT_STATUS_COLOR: Record<
  PaymentStatus,
  { bg: string; color: string }
> = {
  [PaymentStatus.PENDING]: { bg: "#FFF6E5", color: "#FF9500" },
  [PaymentStatus.PAID]: { bg: "#E9F9EF", color: "#34C759" },
  [PaymentStatus.OVERDUE]: { bg: "#FFECEC", color: "#FF3B30" },
  [PaymentStatus.CANCELLED]: { bg: "#F2F2F2", color: "#8E8E93" },
  [PaymentStatus.PARTIALLY_PAID]: { bg: "#E3F2FD", color: "#1976D2" },
  [PaymentStatus.DRAFT]: { bg: "#F3F4F6", color: "#6B7280" },
};
