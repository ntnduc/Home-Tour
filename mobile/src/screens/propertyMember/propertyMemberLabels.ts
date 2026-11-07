import { Ionicons } from "@expo/vector-icons";
import React from "react";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/** Functional areas, in display order. Unknown groups fall to the end with their raw key. */
export const GROUP_META: Record<string, { label: string; icon: IoniconName }> =
  {
    PROPERTY: { label: "Quản lý tài sản", icon: "business-outline" },
    ROOM: { label: "Quản lý phòng", icon: "bed-outline" },
    CONTRACT: { label: "Quản lý hợp đồng", icon: "document-text-outline" },
    INVOICE: { label: "Quản lý hóa đơn", icon: "receipt-outline" },
    SERVICE: { label: "Dịch vụ & điện nước", icon: "flash-outline" },
    MAINTENANCE: { label: "Bảo trì & sửa chữa", icon: "construct-outline" },
    REPORT: { label: "Báo cáo", icon: "bar-chart-outline" },
    USER: { label: "Người dùng & phân quyền", icon: "people-outline" },
    TENANT: { label: "Quyền của khách thuê", icon: "person-outline" },
  };

export const PERMISSION_LABEL: Record<string, string> = {
  "PROPERTY.CREATE": "Tạo tài sản",
  "PROPERTY.EDIT": "Chỉnh sửa tài sản",
  "PROPERTY.DELETE": "Xóa tài sản",
  "PROPERTY.VIEW": "Xem tài sản",
  "ROOM.CREATE": "Tạo phòng",
  "ROOM.EDIT": "Chỉnh sửa phòng",
  "ROOM.DELETE": "Xóa phòng",
  "ROOM.VIEW": "Xem phòng",
  "CONTRACT.CREATE": "Tạo hợp đồng",
  "CONTRACT.EDIT": "Chỉnh sửa hợp đồng",
  "CONTRACT.DELETE": "Xóa hợp đồng",
  "CONTRACT.VIEW": "Xem hợp đồng",
  "CONTRACT.TERMINATE": "Chấm dứt hợp đồng",
  "SERVICE.CREATE": "Tạo dịch vụ",
  "SERVICE.EDIT": "Chỉnh sửa dịch vụ",
  "SERVICE.DELETE": "Xóa dịch vụ",
  "SERVICE.VIEW": "Xem dịch vụ",
  "SERVICE.RECORD_UTILITY": "Ghi chỉ số điện nước",
  "INVOICE.CREATE": "Tạo hóa đơn",
  "INVOICE.EDIT": "Chỉnh sửa hóa đơn",
  "INVOICE.DELETE": "Xóa hóa đơn",
  "INVOICE.VIEW": "Xem hóa đơn",
  "INVOICE.RECORD_PAYMENT": "Ghi nhận thanh toán",
  "MAINTENANCE.CREATE": "Tạo yêu cầu bảo trì",
  "MAINTENANCE.EDIT": "Chỉnh sửa yêu cầu bảo trì",
  "MAINTENANCE.VIEW": "Xem yêu cầu bảo trì",
  "MAINTENANCE.ASSIGN": "Phân công xử lý bảo trì",
  "USER.CREATE": "Thêm người dùng",
  "USER.EDIT": "Chỉnh sửa người dùng",
  "USER.DELETE": "Xóa người dùng",
  "USER.VIEW": "Xem người dùng",
  "USER.ASSIGN_ROLE": "Phân vai trò",
  "REPORT.FINANCIAL": "Xem báo cáo tài chính",
  "REPORT.OCCUPANCY": "Xem báo cáo lấp đầy",
  "REPORT.DEBT": "Xem báo cáo công nợ",
  "TENANT.VIEW_CONTRACT": "Xem hợp đồng của mình",
  "TENANT.VIEW_INVOICE": "Xem hóa đơn của mình",
  "TENANT.PAY_INVOICE": "Thanh toán hóa đơn",
  "TENANT.CREATE_MAINTENANCE": "Gửi yêu cầu bảo trì",
};

export const ROLE_LABEL: Record<string, string> = {
  Owner: "Chủ sở hữu",
  "Property Manager": "Quản lý",
  Accountant: "Kế toán",
  Tenant: "Khách thuê",
};

export const groupLabel = (group: string) => GROUP_META[group]?.label ?? group;
export const permissionLabel = (id: string) => PERMISSION_LABEL[id] ?? id;
export const roleLabel = (role: string) => ROLE_LABEL[role] ?? role;

const GROUP_ORDER = Object.keys(GROUP_META);
/** Sort groups by the design order; unknown ones last. */
export const sortGroups = <T extends { group: string }>(groups: T[]): T[] =>
  [...groups].sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a.group);
    const ib = GROUP_ORDER.indexOf(b.group);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
