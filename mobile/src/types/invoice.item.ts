import { ServiceCalculateMethod } from "@/constant/service.constant";
import {
  ContractServiceCreateRequest,
  ContractServiceDetailResponse,
} from "./contract-service";
import { InvoiceStatus } from "./invoice";

export interface InvoiceItem {
  id: string;
  name?: string;
  invoiceId: string;
  amount: number;
  type: InvoiceItemType;
  helperValue?: number;
  oldHelperValue?: number;
  newHelperValue?: number;
  contractServiceId?: string;
  propertyId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  totalAmount?: number;
}

export interface InvoiceItemDetailResponse extends InvoiceItem {
  contractService?: ContractServiceDetailResponse;
}

export interface InvoiceItemCreateRequest extends Omit<
  InvoiceItem,
  "id" | "createdAt" | "updatedAt" | "invoiceId"
> {
  isUpdated: boolean;
  contractService?: ContractServiceCreateRequest;
  name: string;
  contractServiceId?: string;
  calculationMethod?: ServiceCalculateMethod;
}

export enum InvoiceItemType {
  ROOM_RENT = "ROOM_RENT",
  SERVICE_FEE = "SERVICE_FEE",
  DESPOSIT_CONTRACT = "DESPOSIT_CONTRACT",
  OTHER = "OTHER",
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PENDING]: "Chờ thanh toán",
  [InvoiceStatus.PAID]: "Đã thanh toán",
  [InvoiceStatus.PARTIALLY_PAID]: "Thanh toán một phần",
  [InvoiceStatus.OVERDUE]: "Quá hạn",
  [InvoiceStatus.CANCELLED]: "Đã hủy",
  [InvoiceStatus.DRAFT]: "Nháp",
};

export const ITEM_TYPE_LABEL: Record<InvoiceItemType, string> = {
  [InvoiceItemType.ROOM_RENT]: "Tiền phòng",
  [InvoiceItemType.SERVICE_FEE]: "Dịch vụ",
  [InvoiceItemType.DESPOSIT_CONTRACT]: "Cọc",
  [InvoiceItemType.OTHER]: "Khác",
};
