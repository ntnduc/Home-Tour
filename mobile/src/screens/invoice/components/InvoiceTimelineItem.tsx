import PressableScale from "@/components/PressableScale";
import StatusBadge from "@/components/StatusBadge";
import { shadows, tokens, uiColors, uiRadius, uiSpace, uiType, uiWeight } from "@/theme";
import {
  INVOICE_STATUS_BADGE,
  INVOICE_STATUS_COLOR,
  InvoiceListResponse,
  InvoiceStatus,
} from "@/types/invoice";
import { formatCurrency } from "@/utils/appUtil";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatDayMonth, formatTime } from "../invoiceListFormat";

interface Props {
  invoice: InvoiceListResponse;
  /** Hide the connector below the dot (last row of the list). */
  isLast: boolean;
  onPress: (invoice: InvoiceListResponse) => void;
}

const TIME_COL = 52;
const DOT = 12;

/**
 * One invoice on the vertical timeline.
 *
 * ```
 * 14:30   ●─╮ ┌──────────────────────────────┐
 * 03/11   │   │ HD-0001            ● Quá hạn │ code + status badge
 *         │   │ Phòng 101 · HĐ-12 · Nguyễn A │ room · contract · client
 *         │   │ 3.500.000đ                   │ total
 *         │   │ Đã thu 1.000.000 · Còn 2.500.000đ │ payment
 *         │   │ Tạo bởi Trần B               │
 *         │   └──────────────────────────────┘
 * ```
 * The time column is top-aligned with the card header; the dot takes the status color.
 */
const InvoiceTimelineItem = ({ invoice, isLast, onPress }: Props) => {
  const status = invoice.status;
  const badge = INVOICE_STATUS_BADGE[status];
  const dotColor = INVOICE_STATUS_COLOR[status]?.color ?? uiColors.textSubtle;
  const hasRemaining = invoice.remainingAmount > 0 && status !== InvoiceStatus.CANCELLED;
  const remainingColor =
    status === InvoiceStatus.OVERDUE
      ? tokens.colors.error
      : hasRemaining
        ? tokens.palette.amber[500]
        : tokens.colors.success;

  const subtitle = [
    invoice.roomName,
    invoice.contractCode ? `HĐ ${invoice.contractCode}` : undefined,
    invoice.clientName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.row}>
      <View style={styles.timeCol}>
        <Text style={styles.time}>{formatTime(invoice.createdAt)}</Text>
        <Text style={styles.date}>{formatDayMonth(invoice.createdAt)}</Text>
      </View>

      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        {!isLast && <View style={styles.line} />}
      </View>

      <PressableScale
        scaleTo={0.98}
        style={styles.cardWrap}
        accessibilityRole="button"
        accessibilityLabel={`Hóa đơn ${invoice.code ?? ""} ${invoice.roomName ?? ""}`}
        onPress={() => onPress(invoice)}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.code} numberOfLines={1}>
              {invoice.code || "Hóa đơn"}
            </Text>
            <StatusBadge label={badge.label} tone={badge.tone} size="sm" />
          </View>
          {!!subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
          <Text style={styles.total}>{formatCurrency(invoice.totalAmount)}đ</Text>
          <Text style={styles.payment}>
            Đã thu {formatCurrency(invoice.paidAmount)}đ
            {status !== InvoiceStatus.CANCELLED && (
              <Text style={{ color: remainingColor, fontWeight: uiWeight.semibold }}>
                {" · "}
                {hasRemaining ? `Còn ${formatCurrency(invoice.remainingAmount)}đ` : "Đã đủ"}
              </Text>
            )}
          </Text>
          {!!invoice.createdByName && (
            <Text style={styles.creator} numberOfLines={1}>
              Tạo bởi {invoice.createdByName}
            </Text>
          )}
        </View>
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "stretch" },
  timeCol: { width: TIME_COL, paddingTop: 14, alignItems: "flex-end" },
  time: { ...uiType.bodyStrong, fontVariant: ["tabular-nums"] },
  date: uiType.caption,
  rail: { width: 28, alignItems: "center" },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    marginTop: 18,
    borderWidth: 2,
    borderColor: uiColors.canvas,
  },
  line: { flex: 1, width: 2, marginTop: 4, backgroundColor: uiColors.hairline },
  cardWrap: { flex: 1, paddingBottom: uiSpace.gap },
  card: {
    backgroundColor: uiColors.card,
    borderRadius: uiRadius.tile,
    padding: uiSpace.card,
    gap: 6,
    ...shadows.soft,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  code: { ...uiType.section, fontSize: 16, lineHeight: 22, flex: 1 },
  subtitle: uiType.caption,
  total: { ...uiType.title, fontSize: 20, lineHeight: 26 },
  payment: uiType.body,
  creator: { ...uiType.caption, color: uiColors.textSubtle },
});

export default React.memo(InvoiceTimelineItem);
