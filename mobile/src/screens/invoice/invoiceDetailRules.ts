import { InvoiceStatus } from "@/types/invoice";

/** Statuses that still owe money and can take a payment. */
const PAYABLE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.PENDING,
  InvoiceStatus.PARTIALLY_PAID,
  InvoiceStatus.OVERDUE,
];

/** Statuses that can still be cancelled (nothing settled yet). */
const CANCELLABLE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.DRAFT,
  InvoiceStatus.PENDING,
];

export interface InvoiceActionRules {
  canPay: boolean;
  canCancel: boolean;
}

/** Which bottom actions the detail screen offers for a status (PAID/CANCELLED → none). */
export const getInvoiceActionRules = (
  status: InvoiceStatus,
): InvoiceActionRules => ({
  canPay: PAYABLE_STATUSES.includes(status),
  canCancel: CANCELLABLE_STATUSES.includes(status),
});

const DAY_MS = 1000 * 60 * 60 * 24;

/** Whole days past the due date (0 when not late). */
export const getDaysOverdue = (dueDate: Date | string): number => {
  const diff = Math.ceil((Date.now() - new Date(dueDate).getTime()) / DAY_MS);
  return diff > 0 ? diff : 0;
};

/** Late = flagged OVERDUE, or still unsettled past the due date. */
export const isInvoiceLate = (
  status: InvoiceStatus,
  dueDate: Date | string,
): boolean => {
  if (status === InvoiceStatus.OVERDUE) return true;
  if (!PAYABLE_STATUSES.includes(status)) return false;
  return getDaysOverdue(dueDate) > 0;
};
