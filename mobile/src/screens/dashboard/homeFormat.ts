import { formatCurrency } from "@/utils/appUtil";

const WEEKDAYS = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

/** "Thứ hai, 5 tháng 10" */
export const formatHeaderDate = (date: Date = new Date()) =>
  `${WEEKDAYS[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}`;

export const getGreeting = (date: Date = new Date()) => {
  const hour = date.getHours();
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 14) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

/** Rút gọn số tiền cho widget nhỏ: 1,2 tỷ · 12,5 tr · 850 N */
export const formatCompactMoney = (value: number) => {
  const abs = Math.abs(value);
  const fmt = (n: number) =>
    (Math.round(n * 10) / 10).toString().replace(".", ",");
  if (abs >= 1_000_000_000) return `${fmt(value / 1_000_000_000)} tỷ`;
  if (abs >= 1_000_000) return `${fmt(value / 1_000_000)} tr`;
  if (abs >= 1_000) return `${fmt(value / 1_000)} N`;
  return `${value}`;
};

export const formatMoney = (value: number) => `${formatCurrency(value)} ₫`;

export const formatPercent = (value: number) => `${Math.round(value)}%`;

export const getInitials = (fullName?: string) => {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  const first = parts.length > 1 ? parts[0] : "";
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
};
