import Card from "@/components/Card";
import IconSquircle, { IconTone } from "@/components/IconSquircle";
import StatusBadge from "@/components/StatusBadge";
import { tokens, uiColors, uiRadius, uiSpace, uiType } from "@/theme";
import {
  INVOICE_STATUS_BADGE,
  InvoiceDetailResponse,
  InvoiceStatus,
} from "@/types/invoice";
import { formatCurrency } from "@/utils/appUtil";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface InvoiceSummaryCardProps {
  invoice: InvoiceDetailResponse;
  /** Drives the leading IconSquircle tone only (error when late). Default false. */
  isLate?: boolean;
}

const money = (value: number | string | undefined) =>
  `${formatCurrency(String(value ?? 0))}đ`;

/**
 * Invoice identity + money overview (top of the detail screen).
 * Same row + amount-tile pattern as the UpdateRoom summary card.
 *
 * ```
 * ┌─────────────────────────────────────────┐ Card soft · radius 24 · p16 · gap 16
 * │ ▣  #HD-001                ● Chờ thanh toán │ IconSquircle md · title · StatusBadge
 * │    Phòng 101 • Tòa A                    │ caption
 * │ ┌─────────────────────────────────────┐ │
 * │ │ CÒN PHẢI THU                        │ │ amount tile · canvas · radius 20
 * │ │ 2.500.000đ                          │ │ display, color by status
 * │ └─────────────────────────────────────┘ │
 * │ Tổng tiền                    5.000.000đ │ body / bodyStrong rows · gap 8
 * │ Đã thu                       2.500.000đ │ success
 * │ Ghi nợ sang kỳ sau             300.000đ │ only when carriedOverAmount > 0
 * └─────────────────────────────────────────┘
 * ```
 */
const InvoiceSummaryCard = ({
  invoice,
  isLate = false,
}: InvoiceSummaryCardProps) => {
  const badge = INVOICE_STATUS_BADGE[invoice.status];
  const isPaid = invoice.status === InvoiceStatus.PAID;
  const isCancelled = invoice.status === InvoiceStatus.CANCELLED;
  const remaining = invoice.remainingAmount ?? 0;
  const place = [invoice.roomName, invoice.propertyName]
    .filter(Boolean)
    .join(" • ");

  const heroLabel = isPaid
    ? "Đã thanh toán đủ"
    : isCancelled
      ? "Hóa đơn đã hủy"
      : "Còn phải thu";
  const heroValue = isPaid ? invoice.totalAmount : remaining;
  const heroColor = isPaid
    ? tokens.colors.success
    : isCancelled
      ? uiColors.textSubtle
      : remaining > 0
        ? tokens.colors.error
        : uiColors.ink;

  const iconTone: IconTone = isPaid
    ? "success"
    : isCancelled
      ? "neutral"
      : isLate
        ? "error"
        : "primary";

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconSquircle icon="receipt-outline" tone={iconTone} />
        <View style={styles.headerText}>
          <Text style={[uiType.section, styles.title]} numberOfLines={1}>
            {invoice.code ? `#${invoice.code}` : "Hóa đơn"}
          </Text>
          {place ? (
            <Text style={uiType.caption} numberOfLines={1}>
              {place}
            </Text>
          ) : null}
        </View>
        <StatusBadge label={badge.label} tone={badge.tone} />
      </View>

      <View style={styles.tile}>
        <Text style={uiType.eyebrow}>{heroLabel}</Text>
        <Text
          style={[uiType.display, { color: heroColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {money(heroValue)}
        </Text>
      </View>

      <View style={styles.breakdown}>
        <View style={styles.row}>
          <Text style={uiType.body}>Tổng tiền</Text>
          <Text style={uiType.bodyStrong}>{money(invoice.totalAmount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={uiType.body}>Đã thu</Text>
          <Text style={[uiType.bodyStrong, { color: tokens.colors.success }]}>
            {money(invoice.paidAmount)}
          </Text>
        </View>
        {(invoice.carriedOverAmount ?? 0) > 0 && (
          <View style={styles.row}>
            <Text style={uiType.body}>Ghi nợ sang kỳ sau</Text>
            <Text style={uiType.bodyStrong}>
              {money(invoice.carriedOverAmount)}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    lineHeight: 24,
  },
  tile: {
    backgroundColor: uiColors.canvas,
    borderRadius: uiRadius.tile,
    padding: uiSpace.card,
    gap: 4,
  },
  breakdown: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default InvoiceSummaryCard;
