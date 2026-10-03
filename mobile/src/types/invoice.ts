import { StatusOption } from "@/components/Status";
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

export const INVOICE_STATUS_COLOR: Record<
  InvoiceStatus,
  { bg: string; color: string }
> = {
  [InvoiceStatus.DRAFT]: { bg: "#F3F4F6", color: "#6B7280" },
  [InvoiceStatus.PENDING]: { bg: "#FFF6E5", color: "#FF9500" },
  [InvoiceStatus.PAID]: { bg: "#E9F9EF", color: "#34C759" },
  [InvoiceStatus.PARTIALLY_PAID]: { bg: "#E3F2FD", color: "#1976D2" },
  [InvoiceStatus.OVERDUE]: { bg: "#FFECEC", color: "#FF3B30" },
  [InvoiceStatus.CANCELLED]: { bg: "#F2F2F2", color: "#8E8E93" },
};

export const INVOICE_STATUS_OPTIONS: StatusOption[] = [
  {
    value: InvoiceStatus.DRAFT,
    label: "Nháp",
    textStyle: { color: INVOICE_STATUS_COLOR[InvoiceStatus.DRAFT].color },
    style: { backgroundColor: INVOICE_STATUS_COLOR[InvoiceStatus.DRAFT].bg },
  },
  {
    value: InvoiceStatus.PENDING,
    label: "Pending",
    type: "default",
    textStyle: { color: INVOICE_STATUS_COLOR[InvoiceStatus.PENDING].color },
    style: { backgroundColor: INVOICE_STATUS_COLOR[InvoiceStatus.PENDING].bg },
  },
  {
    value: InvoiceStatus.PAID,
    label: "Paid",
    type: "default",
    textStyle: { color: INVOICE_STATUS_COLOR[InvoiceStatus.PAID].color },
    style: { backgroundColor: INVOICE_STATUS_COLOR[InvoiceStatus.PAID].bg },
  },
  {
    value: InvoiceStatus.PARTIALLY_PAID,
    label: "Partially Paid",
    type: "default",
    textStyle: {
      color: INVOICE_STATUS_COLOR[InvoiceStatus.PARTIALLY_PAID].color,
    },
    style: {
      backgroundColor: INVOICE_STATUS_COLOR[InvoiceStatus.PARTIALLY_PAID].bg,
    },
  },
  {
    value: InvoiceStatus.OVERDUE,
    label: "Overdue",
    type: "default",
    textStyle: { color: INVOICE_STATUS_COLOR[InvoiceStatus.OVERDUE].color },
    style: { backgroundColor: INVOICE_STATUS_COLOR[InvoiceStatus.OVERDUE].bg },
  },
  {
    value: InvoiceStatus.CANCELLED,
    label: "Cancelled",
    type: "default",
    textStyle: { color: INVOICE_STATUS_COLOR[InvoiceStatus.CANCELLED].color },
    style: {
      backgroundColor: INVOICE_STATUS_COLOR[InvoiceStatus.CANCELLED].bg,
    },
  },
];
