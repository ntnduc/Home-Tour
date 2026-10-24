import { InvoiceStatus } from 'src/common/enums/invoice.enum';
import { roundMoney } from 'src/common/utils/number.utils';
import { resolveInvoiceStatus } from '../payment/payment.service';

export type InvoicePaymentSnapshot = {
  paidAmount: number;
  remainingAmount: number;
  dueDate: Date;
};

export type InvoicePaymentResult = {
  paidAmount: number;
  remainingAmount: number;
  /** Unpaid balance that is forwarded to the next invoice (isCarryOver). */
  carriedOverAmount: number;
  status: InvoiceStatus;
};

/**
 * Calculates the invoice figures after one payment.
 * - Fully paid -> PAID.
 * - Partial + isCarryOver -> the shortfall is carried to the next invoice: this
 *   invoice is settled (PAID, remaining 0) and carriedOverAmount keeps the debt.
 * - Partial without isCarryOver -> PARTIALLY_PAID (BR-009), debt stays on this invoice.
 */
export function calculateInvoicePayment(
  invoice: InvoicePaymentSnapshot,
  payment: { amount: number; isCarryOver?: boolean },
  now: Date = new Date(),
): InvoicePaymentResult {
  const paidAmount = roundMoney(
    Number(invoice.paidAmount ?? 0) + Number(payment.amount),
  );
  const remainingAmount = Math.max(
    0,
    roundMoney(Number(invoice.remainingAmount) - Number(payment.amount)),
  );

  if (remainingAmount > 0 && payment.isCarryOver) {
    return {
      paidAmount,
      remainingAmount: 0,
      carriedOverAmount: remainingAmount,
      status: InvoiceStatus.PAID,
    };
  }

  return {
    paidAmount,
    remainingAmount,
    carriedOverAmount: 0,
    status: resolveInvoiceStatus({
      paidAmount,
      remainingAmount,
      dueDate: invoice.dueDate,
      now,
    }),
  };
}
