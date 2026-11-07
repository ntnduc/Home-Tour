import Card from "@/components/Card";
import IconSquircle, { IconTone } from "@/components/IconSquircle";
import StatusBadge from "@/components/StatusBadge";
import { tokens, uiType } from "@/theme";
import { INVOICE_STATUS_BADGE, InvoiceStatus } from "@/types/invoice";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface InvoiceDraftSummaryCardProps {
  /** Shown as `code || "Chưa cấp mã"`. */
  code?: string;
  /** Already resolved by the parent: `invoice.status ?? InvoiceStatus.DRAFT`. */
  status: InvoiceStatus;
  /** Pre-formatted: `${formatCurrency((Number(invoice.remainingAmount) || 0).toString())}đ`. */
  remainingText: string;
}

/**
 * Identity + amount-due overview of the draft invoice shown after contract creation.
 *
 * ```
 * ┌─────────────────────────────────────────────────┐ Card soft · radius 24 · p16 · gap 16
 * │ ▣  Mã hóa đơn                       ● Nháp      │ IconSquircle md · caption · StatusBadge
 * │    HD-001 / Chưa cấp mã                         │ section (one line)
 * │ ┌─────────────────────────────────────────────┐ │
 * │ │ SỐ TIỀN CẦN THANH TOÁN                      │ │ tile canvas · radius 20
 * │ │ 3.500.000đ                                  │ │ display · info
 * │ └─────────────────────────────────────────────┘ │
 * └─────────────────────────────────────────────────┘
 * ```
 * Icon tone follows the status: paid → success, cancelled → neutral, otherwise primary.
 */
const InvoiceDraftSummaryCard = ({
  code,
  status,
  remainingText,
}: InvoiceDraftSummaryCardProps) => {
  const badge = INVOICE_STATUS_BADGE[status];
  const iconTone: IconTone =
    status === InvoiceStatus.PAID
      ? "success"
      : status === InvoiceStatus.CANCELLED
        ? "neutral"
        : "primary";

  return (
    <Card style={styles.card}>
      <IconSquircle icon="receipt-outline" tone={iconTone} />
      <View style={styles.text}>
        <Text style={[uiType.section, styles.code]} numberOfLines={1}>
          {code || "Chưa cấp mã"}
        </Text>
        <Text style={styles.amount} numberOfLines={1}>
          Cần thanh toán: {remainingText}
        </Text>
      </View>
      <StatusBadge label={badge.label} tone={badge.tone} />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  code: {
    lineHeight: 24,
  },
  amount: {
    ...uiType.bodyStrong,
    color: tokens.colors.info,
  },
});

export default InvoiceDraftSummaryCard;
