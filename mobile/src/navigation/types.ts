import { InvoiceCreateRequest } from "@/types/invoice";
import { Room } from "@/types/room";
import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  // Auth Flow
  Login: undefined;
  OTPVerification: { phoneNumber: string };
  Register: { registrationToken: string };

  // Main App
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;

  // Property Management
  PropertyList: undefined;
  PropertyDetail: { propertyId: string };
  CreateProperty: undefined;
  UpdateProperty: { propertyId: string };
  PropertyMembers: { propertyId: string };
  MyInvitations: undefined;

  // Room Management
  RoomList: { propertyId?: string };
  RoomDetail: { roomId: string };
  CreateRoom: { propertyId: string };
  UpdateRoom: { roomId: string; room: Room };

  // Tenant Management
  TenantList: undefined;
  TenantDetail: { tenantId: string };
  CreateTenant: { roomId?: string };
  UpdateTenant: { tenantId: string };

  // Contract Management
  ContractList: undefined;
  ContractDetail: { contractId: string };
  CreateContract: { roomId?: string; tenantId?: string };
  TerminateContract: { contractId: string };

  // Invoice Management
  InvoiceDetail: {
    invoiceId: string;
    fromHistory?: boolean;
    // Set when the invoice is the pre-invoice of a contract awaiting payment confirmation
    confirmContractId?: string;
    // Set when opened from another flow (e.g. contract deactivation): go back to that
    // origin screen after the invoice is paid / cancelled. Omit for the default behavior.
    returnToOrigin?: boolean;
    // Header back button navigates to this root screen (with goBackParams); null/undefined = default back
    goBackScreen?: keyof RootStackParamList | null;
    goBackParams?: Record<string, unknown> | null;
  };
  /** Optional pre-applied quick filters (opened from a room / contract). */
  InvoiceList:
    | {
        roomId?: string;
        roomName?: string;
        contractId?: string;
        contractLabel?: string;
      }
    | undefined;
  CreateInvoice: { contractId?: string; roomId?: string };
  ConfirmCreateInvoice: {
    invoice: InvoiceCreateRequest;
  };
  ConfirmDraftInvoice: {
    invoiceId: string;
    // Pre-invoice of a just-created contract: must be confirmed or cancelled, no going back
    isPreInvoice?: boolean;
  };
  InvoiceDetailScreen: { invoiceId: string };

  // Reports
  ReportDashboard: undefined;

  // Profile
  Profile: undefined;
  EditProfile: undefined;

  // Test
  TestScreen: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Properties: undefined;
  Rooms: undefined;
  Contracts: undefined;
  Reports: undefined;
  Profile: undefined;
  TestScreen: undefined;
};
