import { STATUS_TONE_COLOR, StatusBadgeSpec } from "@/theme";
import { StatusColorValue } from "@/theme/status";

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
  /** Field name returned by the backend payment DTO. */
  notes?: string;
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

/** Single source of truth: payment status → badge label + tone. */
export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, StatusBadgeSpec> = {
  [PaymentStatus.PENDING]: { label: PAYMENT_STATUS_LABEL[PaymentStatus.PENDING], tone: "warning" },
  [PaymentStatus.PAID]: { label: PAYMENT_STATUS_LABEL[PaymentStatus.PAID], tone: "success" },
  [PaymentStatus.OVERDUE]: { label: PAYMENT_STATUS_LABEL[PaymentStatus.OVERDUE], tone: "error" },
  [PaymentStatus.CANCELLED]: { label: PAYMENT_STATUS_LABEL[PaymentStatus.CANCELLED], tone: "cancelled" },
  [PaymentStatus.PARTIALLY_PAID]: { label: PAYMENT_STATUS_LABEL[PaymentStatus.PARTIALLY_PAID], tone: "info" },
  [PaymentStatus.DRAFT]: { label: PAYMENT_STATUS_LABEL[PaymentStatus.DRAFT], tone: "neutral" },
};

/** Derived `{ bg, color }` for call sites that tint custom layouts. */
export const PAYMENT_STATUS_COLOR: Record<PaymentStatus, StatusColorValue> = Object.fromEntries(
  Object.entries(PAYMENT_STATUS_BADGE).map(([k, v]) => [k, STATUS_TONE_COLOR[v.tone]]),
) as Record<PaymentStatus, StatusColorValue>;
