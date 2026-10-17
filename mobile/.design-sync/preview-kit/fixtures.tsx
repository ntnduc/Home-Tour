// Shared sample data + phone frame for the Home Tour previews.
// Shapes mirror the real API payloads (src/types/homepage.ts, property.ts).
import React from "react";
import { View, homeColors } from "home-tour-mobile";

/** Phone-width canvas (390pt, iPhone 14/15) with the app's screen background. */
export const Phone = ({
  children,
  pad = 20,
  bg = homeColors.canvas,
}: {
  children: React.ReactNode;
  pad?: number;
  bg?: string;
}) => (
  <View style={{ width: 390, backgroundColor: bg, padding: pad }}>{children}</View>
);

export const noop = () => {};

export const summary = {
  properties: [
    { id: "p1", name: "Nhà trọ Hòa Bình" },
    { id: "p2", name: "CCMN Cầu Giấy" },
    { id: "p3", name: "Phòng trọ Thủ Đức" },
  ],
  period: { month: 10, year: 2026 },
  rooms: {
    total: 42,
    occupied: 35,
    available: 4,
    maintenance: 1,
    pendingDeposit: 2,
    unavailable: 0,
    occupancyRate: 83,
  },
  tenantsCount: 58,
  revenue: {
    expected: 128_500_000,
    collected: 96_400_000,
    outstanding: 32_100_000,
    collectionRate: 75,
  },
  overdueInvoiceCount: 3,
  expiringContractCount: 2,
};

export const summaryFull = {
  ...summary,
  rooms: { ...summary.rooms, occupied: 42, available: 0, pendingDeposit: 0, maintenance: 0, occupancyRate: 100 },
  revenue: { expected: 128_500_000, collected: 128_500_000, outstanding: 0, collectionRate: 100 },
  overdueInvoiceCount: 0,
  expiringContractCount: 0,
};

export const alerts = [
  {
    id: "a1",
    type: "INVOICE_OVERDUE" as const,
    severity: "critical" as const,
    title: "Hóa đơn quá hạn",
    message: "Phòng 201 chưa thanh toán tiền tháng 10",
    roomId: "r201",
    roomName: "P.201",
    propertyName: "Nhà trọ Hòa Bình",
    amount: 3_500_000,
    date: "2026-10-05",
    target: { invoiceId: "inv-1" },
  },
  {
    id: "a2",
    type: "CONTRACT_EXPIRING" as const,
    severity: "warning" as const,
    title: "Hợp đồng sắp hết hạn",
    message: "Hợp đồng phòng 305 hết hạn sau 7 ngày",
    roomId: "r305",
    roomName: "P.305",
    propertyName: "CCMN Cầu Giấy",
    date: "2026-10-24",
    target: { contractId: "ct-1" },
  },
  {
    id: "a3",
    type: "INVOICE_DUE_SOON" as const,
    severity: "info" as const,
    title: "Hóa đơn sắp đến hạn",
    message: "Phòng 102 đến hạn thanh toán ngày 20/10",
    roomId: "r102",
    roomName: "P.102",
    propertyName: "Phòng trọ Thủ Đức",
    amount: 2_800_000,
    date: "2026-10-20",
    target: { invoiceId: "inv-2" },
  },
];

export const rooms = [
  {
    roomId: "r201",
    roomName: "P.201",
    propertyId: "p1",
    propertyName: "Nhà trọ Hòa Bình",
    status: "OCCUPIED" as const,
    rentAmount: 3_500_000,
    tenantName: "Nguyễn Văn An",
    topAction: { type: "INVOICE_PAYMENT" as const, label: "Thu tiền", severity: "overdue" as const, payload: { invoiceId: "inv-1" } },
    pendingTaskCount: 2,
    hasOverdueAlert: true,
  },
  {
    roomId: "r104",
    roomName: "P.104",
    propertyId: "p1",
    propertyName: "Nhà trọ Hòa Bình",
    status: "PENDING_DEPOSIT" as const,
    rentAmount: 3_000_000,
    tenantName: "Trần Thị Bình",
    topAction: { type: "CONFIRM_DEPOSIT" as const, label: "Xác nhận cọc", severity: "warning" as const, payload: { roomId: "r104" } },
    pendingTaskCount: 1,
    hasOverdueAlert: false,
  },
  {
    roomId: "r302",
    roomName: "P.302",
    propertyId: "p2",
    propertyName: "CCMN Cầu Giấy",
    status: "AVAILABLE" as const,
    rentAmount: 4_200_000,
    topAction: { type: "CREATE_CONTRACT" as const, label: "Tạo hợp đồng", severity: "normal" as const, payload: { roomId: "r302" } },
    pendingTaskCount: 0,
    hasOverdueAlert: false,
  },
  {
    roomId: "r110",
    roomName: "P.110",
    propertyId: "p3",
    propertyName: "Phòng trọ Thủ Đức",
    status: "MAINTENANCE" as const,
    rentAmount: 2_500_000,
    pendingTaskCount: 0,
    hasOverdueAlert: false,
  },
];

const baseProperty = {
  provinceCode: "01",
  districtCode: "005",
  wardCode: "00163",
  images: [] as string[],
  services: [
    { id: "s1", name: "Điện", price: 3_800 },
    { id: "s2", name: "Nước", price: 100_000 },
    { id: "s3", name: "Wifi", price: 50_000 },
  ],
};

export const properties = [
  {
    ...baseProperty,
    id: "p1",
    name: "Nhà trọ Hòa Bình",
    address: "12 Ngõ 68 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội",
    defaultRoomRent: 3_500_000,
    paymentDate: 5,
    numberFloor: 4,
    totalRoom: 16,
    statusRooms: "PARTIAL" as const,
    totalRoomOccupied: 12,
  },
  {
    ...baseProperty,
    id: "p2",
    name: "CCMN Cầu Giấy",
    address: "45 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    defaultRoomRent: 4_200_000,
    paymentDate: 10,
    numberFloor: 6,
    totalRoom: 18,
    statusRooms: "FULL" as const,
    totalRoomOccupied: 18,
  },
  {
    ...baseProperty,
    id: "p3",
    name: "Phòng trọ Thủ Đức",
    address: "89 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh",
    defaultRoomRent: 2_500_000,
    paymentDate: 1,
    numberFloor: 2,
    totalRoom: 8,
    statusRooms: "EMPTY" as const,
    totalRoomOccupied: 0,
  },
];
