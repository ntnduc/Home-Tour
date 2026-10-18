/**
 * Contract details tile — nested inside the room card (no shadow, canvas background).
 *
 * ```
 * ┌ RoomContractTile (ACTIVE contract only) ┐ bg uiColors.canvas · r16 · padding 12 · gap 10
 * │ (👤) Nguyễn A        [● Đang hiệu lực] │ IconSquircle sm + 14/20 semibold ink + StatusBadge sm
 * │      HĐ #HD-001                        │ caption
 * │ ──────────────────────────────────────  │ hairline divider
 * │ HẠN THANH TOÁN          TỔNG HOÁ ĐƠN   │ 2 equal columns (flex 1, gap 12) with eyebrow headers
 * │ 12/10/2026              1.200.000đ     │ 14/20 bold · due colored · amount primary
 * └────────────────────────────────────────┘
 * ```
 */
import { tokens, uiColors, uiType, uiWeight } from "@/theme";
import { CONTRACT_STATUS_BADGE, ContractListResponse } from "@/types/contract";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import IconSquircle from "@/components/IconSquircle";
import StatusBadge from "@/components/StatusBadge";

export interface RoomContractTileProps {
  contract: ContractListResponse;
  tenantName: string;
}

/** Due-date color: overdue → error · within 3 days → warning · otherwise default. */
const getDueDateColor = (endDate: string | Date) => {
  const due = new Date(endDate);
  const now = new Date();
  if (due < now) return tokens.colors.error;
  if (due <= new Date(new Date().setDate(now.getDate() + 3))) {
    return tokens.palette.amber[600];
  }
  return uiColors.ink;
};

const RoomContractTile = ({ contract, tenantName }: RoomContractTileProps) => {
  const contractBadge = CONTRACT_STATUS_BADGE[contract.status];

  return (
    <View style={styles.container}>
      {/* Tenant row with status badge */}
      <View style={styles.tenantRow}>
        <IconSquircle icon="person-outline" size="sm" tone="neutral" />
        <View style={styles.tenantInfo}>
          <Text style={styles.tenantName} numberOfLines={1}>
            {tenantName}
          </Text>
          <Text style={uiType.caption}>HĐ #{contract.code}</Text>
        </View>
        <StatusBadge
          label={contractBadge.label}
          tone={contractBadge.tone}
          size="sm"
          showDot
        />
      </View>

      {/* Divider + stats row (only if at least one column applies) */}
      {contract.endDate || contract.id ? (
        <>
          <View style={styles.divider} />

          {/* Due date & amount columns */}
          <View style={styles.statsRow}>
            {contract.endDate ? (
              <View style={styles.column}>
                <Text style={uiType.eyebrow}>HẠN THANH TOÁN</Text>
                <Text
                  style={[styles.statValue, { color: getDueDateColor(contract.endDate) }]}
                >
                  {formatDate(contract.endDate)}
                </Text>
              </View>
            ) : null}

            {contract.id ? (
              <View style={styles.column}>
                <Text style={uiType.eyebrow}>TỔNG HOÁ ĐƠN</Text>
                <Text style={[styles.statValue, styles.amountValue]}>
                  {formatCurrency(contract.depositAmountPaid ?? 0)}đ
                </Text>
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: uiColors.canvas,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  tenantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tenantInfo: {
    flex: 1,
    gap: 2,
  },
  tenantName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: uiWeight.semibold,
    color: uiColors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: uiColors.hairline,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: uiWeight.bold,
    color: uiColors.ink,
  },
  amountValue: {
    color: tokens.colors.primary,
  },
});

export default RoomContractTile;
