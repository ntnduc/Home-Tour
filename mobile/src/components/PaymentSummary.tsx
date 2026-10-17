import { STATUS_TONE_COLOR, StatusTone, uiColors, uiType, uiWeight, tokens } from "@/theme";
import { formatCurrency } from "@/utils/appUtil";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Card from "./Card";

interface PaymentSummaryProps {
  totalRooms: number;
  pendingPayments: number;
  overduePayments: number;
  paidPayments: number;
  totalAmount: number;
}

type Stat = { label: string; value: number; tone: StatusTone | "primary" };

/**
 * Payment overview card (room list header).
 *
 * ```
 * ┌─────────────────────────────────────────────┐ Card soft
 * │ TỔNG QUAN THANH TOÁN                        │ eyebrow
 * │  (12)      (3)       (1)        (8)         │ tinted number circles
 * │ Tổng phòng  Chờ TT   Quá hạn   Đã TT        │ caption
 * │ ─────────────────────────────────────────   │
 * │ Tổng tiền cần thu              12.500.000đ  │
 * └─────────────────────────────────────────────┘
 * ```
 */
const PaymentSummary = ({
  totalRooms,
  pendingPayments,
  overduePayments,
  paidPayments,
  totalAmount,
}: PaymentSummaryProps) => {
  const stats: Stat[] = [
    { label: "Tổng phòng", value: totalRooms, tone: "primary" },
    { label: "Chờ thanh toán", value: pendingPayments, tone: "warning" },
    { label: "Quá hạn", value: overduePayments, tone: "error" },
    { label: "Đã thanh toán", value: paidPayments, tone: "success" },
  ];

  return (
    <Card style={styles.card}>
      <Text style={uiType.eyebrow}>Tổng quan thanh toán</Text>
      <View style={styles.statsRow}>
        {stats.map((stat) => {
          const colors =
            stat.tone === "primary"
              ? { bg: tokens.colors.primaryMuted, color: tokens.colors.primary }
              : STATUS_TONE_COLOR[stat.tone];
          return (
            <View key={stat.label} style={styles.stat}>
              <View style={[styles.statCircle, { backgroundColor: colors.bg }]}>
                <Text style={[styles.statNumber, { color: colors.color }]}>{stat.value}</Text>
              </View>
              <Text style={[uiType.caption, styles.center]} numberOfLines={2}>
                {stat.label}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.totalRow}>
        <Text style={uiType.body}>Tổng tiền cần thu</Text>
        <Text style={styles.totalAmount}>{formatCurrency(String(totalAmount))}đ</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 15,
    fontWeight: uiWeight.bold,
  },
  center: {
    textAlign: "center",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: uiColors.hairline,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: uiWeight.bold,
    color: tokens.colors.primary,
  },
});

export default PaymentSummary;
