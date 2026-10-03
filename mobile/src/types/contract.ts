import { StatusType } from "@/components/Status";
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

export const CONTRACT_STATUS_COLOR: Record<
  ContractStatus,
  { bg: string; color: string }
> = {
  [ContractStatus.DRAFT]: { bg: "#F3F4F6", color: "#6B7280" },
  [ContractStatus.PENDING_START]: { bg: "#F3F4F6", color: "#6B7280" },
  [ContractStatus.ACTIVE]: { bg: "#E9F9EF", color: "#34C759" },
  [ContractStatus.ENDED]: { bg: "#FFECEC", color: "#FF3B30" },
  [ContractStatus.TERMINATED_EARLY]: { bg: "#F3F4F6", color: "#6B7280" },
  [ContractStatus.EXPIRED]: { bg: "#FFF6E5", color: "#FF9500" },
};

export const CONTRACT_STATUS_ICON: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: "pencil-outline",
  [ContractStatus.PENDING_START]: "document-outline",
  [ContractStatus.ACTIVE]: "checkmark-circle",
  [ContractStatus.ENDED]: "time-outline",
  [ContractStatus.TERMINATED_EARLY]: "close-circle",
  [ContractStatus.EXPIRED]: "ellipse-outline",
};

export const CONTRACT_STATUS_BADGE: Record<
  ContractStatus,
  { key: StatusType; label?: string; bg?: string; color?: string }
> = {
  [ContractStatus.DRAFT]: {
    label: "Nháp",
    key: "default",
    ...CONTRACT_STATUS_COLOR[ContractStatus.DRAFT],
  },
  [ContractStatus.PENDING_START]: {
    label: "Chờ bắt đầu",
    key: "info",
    ...CONTRACT_STATUS_COLOR[ContractStatus.PENDING_START],
  },
  [ContractStatus.ACTIVE]: {
    label: "Đang hiệu lực",
    key: "success",
    ...CONTRACT_STATUS_COLOR[ContractStatus.ACTIVE],
  },
  [ContractStatus.ENDED]: {
    label: "Đã kết thúc",
    key: "error",
    ...CONTRACT_STATUS_COLOR[ContractStatus.ENDED],
  },
  [ContractStatus.TERMINATED_EARLY]: {
    label: "Đã kết thúc sớm",
    key: "warning",
    ...CONTRACT_STATUS_COLOR[ContractStatus.TERMINATED_EARLY],
  },
  [ContractStatus.EXPIRED]: {
    label: "Hết hạn",
    key: "info",
    ...CONTRACT_STATUS_COLOR[ContractStatus.EXPIRED],
  },
};
