import { InvoiceListResponse } from "@/types/invoice";

const pad = (value: number) => String(value).padStart(2, "0");

/** "14:30" from an ISO timestamp. */
export const formatTime = (iso?: string): string => {
  if (!iso) return "--:--";
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** "03/11" from an ISO timestamp. */
export const formatDayMonth = (iso?: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
};

/** "03/11/2026" from an ISO timestamp. */
export const formatFullDate = (iso?: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  return `${formatDayMonth(iso)}/${date.getFullYear()}`;
};

/** yyyy-MM-dd in local time, for API date filters. */
export const toApiDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Day bucket label: "Hôm nay", "Hôm qua" or "dd/MM/yyyy". */
export const getDayLabel = (iso?: string): string => {
  if (!iso) return "Không rõ ngày";
  const date = new Date(iso);
  const today = new Date();
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(date)) / 86_400_000);
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  return formatFullDate(iso);
};

export type InvoiceTimelineRow =
  | { type: "day"; key: string; label: string }
  | { type: "invoice"; key: string; invoice: InvoiceListResponse };

/** Flattens invoices into rows with a day header whenever the creation day changes. */
export const buildTimelineRows = (
  invoices: InvoiceListResponse[],
): InvoiceTimelineRow[] => {
  const rows: InvoiceTimelineRow[] = [];
  let lastLabel = "";
  invoices.forEach((invoice) => {
    const label = getDayLabel(invoice.createdAt);
    const dayKey = invoice.createdAt ? toApiDate(new Date(invoice.createdAt)) : "unknown";
    if (label !== lastLabel) {
      rows.push({ type: "day", key: `day-${dayKey}-${rows.length}`, label });
      lastLabel = label;
    }
    rows.push({ type: "invoice", key: invoice.id, invoice });
  });
  return rows;
};
