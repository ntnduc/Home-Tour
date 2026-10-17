import { StatusOption } from "@/components/Status";
import { STATUS_TONE_COLOR, StatusBadgeSpec } from "@/theme";
import { StatusColorValue } from "@/theme/status";
import { ContractDetailResponse } from "./contract";
import {
  InvoiceItemCreateRequest,
  InvoiceItemDetailResponse,
} from "./invoice.item";

export interface Invoice {
  id: string;
  code?: string;
  contractId: string;
  roomId: string;
  propertyId: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

export interface InvoiceDetailResponse extends Omit<Invoice, "id"> {
  id?: string;
  isPrepaid: boolean;
  roomName: string;
  clientName?: string;
  propertyName?: string;
  amount?: string;
  paymentMethod?: string;
  contract?: ContractDetailResponse;
  paymentDate?: string;
  paymentMonth?: number;
  invoiceItems?: InvoiceItemDetailResponse[];
}

export interface InvoiceListResponse extends Invoice {}

export interface InvoiceCreateRequest extends Omit<
  Invoice,
  "id" | "createdAt" | "updatedAt"
> {
  isPrepaid: boolean;
  roomName: string;
  clientName?: string;
  propertyName?: string;
  contract?: ContractDetailResponse;
  paymentMonth?: number;
  invoiceItems?: InvoiceItemCreateRequest[];
}

export interface InvoiceUpdateRequest extends Omit<
  Invoice,
  "id" | "createdAt" | "updatedAt"
> {}

export interface InvoiceItemPriceUpdateRequest {
  id: string;
  amount: number;
}

export interface InvoiceUpdateItemsRequest {
  /** Id của hóa đơn cần cập nhật khoản mục. */
  id: string;
  invoiceItems: InvoiceItemPriceUpdateRequest[];
}

export interface InvoicePaymentRequest {
  id: string;
  paidAmount: number;
  remainingAmount: number;
  isCarryOver?: boolean;
  // dueDate: string;
  // contractId: string;
  notes?: string;
  paymentMethod: string;
}

export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
  DRAFT = "DRAFT",
}

/** Single source of truth: invoice status → badge label + tone. */
export const INVOICE_STATUS_BADGE: Record<InvoiceStatus, StatusBadgeSpec> = {
  [InvoiceStatus.DRAFT]: { label: "Nháp", tone: "neutral" },
  [InvoiceStatus.PENDING]: { label: "Chờ thanh toán", tone: "warning" },
  [InvoiceStatus.PAID]: { label: "Đã thanh toán", tone: "success" },
  [InvoiceStatus.PARTIALLY_PAID]: { label: "Thanh toán một phần", tone: "info" },
  [InvoiceStatus.OVERDUE]: { label: "Quá hạn", tone: "error" },
  [InvoiceStatus.CANCELLED]: { label: "Đã hủy", tone: "cancelled" },
};

/** Derived `{ bg, color }` for call sites that tint custom layouts. */
export const INVOICE_STATUS_COLOR: Record<InvoiceStatus, StatusColorValue> = Object.fromEntries(
  Object.entries(INVOICE_STATUS_BADGE).map(([k, v]) => [k, STATUS_TONE_COLOR[v.tone]]),
) as Record<InvoiceStatus, StatusColorValue>;

export const INVOICE_STATUS_OPTIONS: StatusOption[] = Object.entries(INVOICE_STATUS_BADGE).map(
  ([value, badge]) => ({ value, label: badge.label, type: badge.tone }),
);
