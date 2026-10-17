import { STATUS_TONE_COLOR, StatusBadgeSpec } from "@/theme";
import { StatusColorValue } from "@/theme/status";
import { ClientCreateRequest } from "./client";
import {
  ContractClientDetailResponse,
  ContractClientListResponse,
} from "./contract-client";
import {
  ContractServiceCreateRequest,
  ContractServiceDetailResponse,
} from "./contract-service";
import { PropertyDetail } from "./property";
import { RoomDetailResponse } from "./room";

export enum ContractStatus {
  DRAFT = "DRAFT",
  PENDING_START = "PENDING_START",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
  TERMINATED_EARLY = "TERMINATED_EARLY",
  EXPIRED = "EXPIRED",
}

export interface Contract {
  id: string;
  propertyId: string;
  code: string;
  roomId: string;
  startDate: string;
  endDate?: string;
  rentAmountAgreed: number;
  depositAmountPaid: number;
  paymentDueDay: number;
  contractScanURL?: string;
  status: ContractStatus;
  notes?: string;
  partnerClientCount?: number;
  isPrepaidRoom?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ContractCreateRequest extends Omit<Contract, "id" | "status"> {
  contractServices: ContractServiceCreateRequest[];
  contractClient: ClientCreateRequest[];
  contractClientLandlord: ClientCreateRequest;
  ignoreAutoUpdatePartnerNumber?: boolean;
}

export interface ContractUpdateRequest {
  id: string;
  propertyId?: string;
  roomId?: string;
  landlordUserId?: string;
  startDate?: string;
  endDate?: string;
  rentAmountAgreed?: number;
  depositAmountPaid?: number;
  paymentDueDay?: number;
  contractScanURL?: string;
  status?: ContractStatus;
  notes?: string;
}

export interface ContractTerminateRequest extends ContractDetailResponse {
  reason?: string;
}

export interface ContractDetailResponse extends Contract {
  room?: RoomDetailResponse;
  property?: PropertyDetail;
  contractClient: ContractClientDetailResponse[];
  contractServices: ContractServiceDetailResponse[];
  /** Id hóa đơn đầu tiên được tạo tự động cùng hợp đồng. */
  preInvoiceId?: string;
}

export interface ContractListResponse extends Contract {
  roomName?: string;
  propertyName?: string;
  client?: ContractClientListResponse[];
}

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: "Nháp",
  [ContractStatus.PENDING_START]: "Chờ bắt đầu",
  [ContractStatus.ACTIVE]: "Đang hiệu lực",
  [ContractStatus.ENDED]: "Đã kết thúc",
  [ContractStatus.TERMINATED_EARLY]: "Đã kết thúc sớm",
  [ContractStatus.EXPIRED]: "Hết hạn",
};


export const CONTRACT_STATUS_ICON: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: "pencil-outline",
  [ContractStatus.PENDING_START]: "document-outline",
  [ContractStatus.ACTIVE]: "checkmark-circle",
  [ContractStatus.ENDED]: "time-outline",
  [ContractStatus.TERMINATED_EARLY]: "close-circle",
  [ContractStatus.EXPIRED]: "ellipse-outline",
};

/** Single source of truth: contract status → badge label + tone. */
export const CONTRACT_STATUS_BADGE: Record<ContractStatus, StatusBadgeSpec> = {
  [ContractStatus.DRAFT]: { label: CONTRACT_STATUS_LABEL[ContractStatus.DRAFT], tone: "neutral" },
  [ContractStatus.PENDING_START]: { label: CONTRACT_STATUS_LABEL[ContractStatus.PENDING_START], tone: "info" },
  [ContractStatus.ACTIVE]: { label: CONTRACT_STATUS_LABEL[ContractStatus.ACTIVE], tone: "success" },
  [ContractStatus.ENDED]: { label: CONTRACT_STATUS_LABEL[ContractStatus.ENDED], tone: "cancelled" },
  [ContractStatus.TERMINATED_EARLY]: { label: CONTRACT_STATUS_LABEL[ContractStatus.TERMINATED_EARLY], tone: "error" },
  [ContractStatus.EXPIRED]: { label: CONTRACT_STATUS_LABEL[ContractStatus.EXPIRED], tone: "warning" },
};

/** Derived `{ bg, color }` for legacy call sites that tint custom layouts. */
export const CONTRACT_STATUS_COLOR: Record<ContractStatus, StatusColorValue> = Object.fromEntries(
  Object.entries(CONTRACT_STATUS_BADGE).map(([k, v]) => [k, STATUS_TONE_COLOR[v.tone]]),
) as Record<ContractStatus, StatusColorValue>;
