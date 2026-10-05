import { RoomAction, RoomStatus } from "@/types/room";

/** Payload của GET /homepage/summary */
export interface HomepagePropertyOption {
  id: string;
  name: string;
}

export interface HomepageRoomStats {
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
  pendingDeposit: number;
  unavailable: number;
  /** 0–100 */
  occupancyRate: number;
}

export interface HomepageRevenue {
  expected: number;
  collected: number;
  outstanding: number;
  /** 0–100 */
  collectionRate: number;
}

export interface HomepageSummary {
  properties: HomepagePropertyOption[];
  period: { month: number; year: number };
  rooms: HomepageRoomStats;
  tenantsCount: number;
  revenue: HomepageRevenue;
  overdueInvoiceCount: number;
  expiringContractCount: number;
}

/** Payload của GET /homepage/room-feed */
export interface HomepageRoomFeedItem {
  roomId: string;
  roomName: string;
  propertyId: string;
  propertyName: string;
  status: RoomStatus;
  rentAmount: number;
  tenantName?: string;
  topAction?: Pick<RoomAction, "type" | "label" | "severity" | "payload">;
  pendingTaskCount: number;
  hasOverdueAlert: boolean;
}

/** Payload của GET /homepage/alerts */
export type HomepageAlertType =
  | "INVOICE_OVERDUE"
  | "INVOICE_DUE_SOON"
  | "CONTRACT_EXPIRING"
  | "CONTRACT_PENDING";

export type HomepageAlertSeverity = "critical" | "warning" | "info";

export interface HomepageAlert {
  id: string;
  type: HomepageAlertType;
  severity: HomepageAlertSeverity;
  title: string;
  message: string;
  roomId: string;
  roomName: string;
  propertyName: string;
  amount?: number;
  /** YYYY-MM-DD */
  date: string;
  target: { invoiceId?: string; contractId?: string };
}

export interface HomepageAlertList {
  items: HomepageAlert[];
  total: number;
}

export interface HomepageQuery {
  propertyId?: string;
  limit?: number;
}
