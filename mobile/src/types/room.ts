import { UploadedFile } from "@/components/Uploadfile";
import { ContractListResponse } from "./contract";
import { ContractServiceDetailResponse } from "./contract-service";
import { InvoiceListResponse } from "./invoice";
import { PropertyDetail } from "./property";

export enum RoomStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE",
  PENDING_DEPOSIT = "PENDING_DEPOSIT",
  UNAVAILABLE = "UNAVAILABLE",
}

export type RoomActionSeverity = "normal" | "warning" | "overdue";

export type RoomActionType =
  | "INVOICE_PAYMENT"
  | "CREATE_INVOICE"
  | "CONFIRM_CONTRACT"
  | "CONFIRM_DEPOSIT"
  | "RENEW_CONTRACT"
  | "CREATE_CONTRACT"
  | "VIEW_CONTRACT"
  | "TERMINATE_CONTRACT";

export interface RoomAction {
  type: RoomActionType;
  label: string;
  priority: number;
  urgent: boolean;
  primary: boolean;
  severity: RoomActionSeverity;
  payload: {
    contractId?: string;
    invoiceId?: string;
    roomId?: string;
    invoiceStatus?: string;
  };
}

export interface Room {
  id: string;
  name: string;
  propertyId: string;
  rentAmount: number;
  maxOccupancy?: number;
  status: RoomStatus;
  floor?: string;
  defaultDepositAmount: number;
  defaultPaymentDueDay: number;
  description?: string;
  area?: number;
  property?: PropertyDetail;
  contracts: ContractListResponse[];
  isPrepaidRoom?: boolean;
  imageCollectionId?: string;
}

export interface RoomListResponse extends Room {
  landlordClient: string;
  invoices?: InvoiceListResponse[];
  actions: RoomAction[];
  pendingTaskCount: number;
  hasOverdueAlert: boolean;
  overdueAlertMessage?: string;
}

export interface RoomDetailResponse extends Room {
  propertyName?: string;
  contractServices: ContractServiceDetailResponse[];
  images?: UploadedFile[];
}

export interface RoomUpdateRequest extends Room {
  propertyName?: string;
}

export interface RoomServiceDetailResponse extends RoomDetailResponse {
  contractServices: ContractServiceDetailResponse[];
  property: PropertyDetail;
}
