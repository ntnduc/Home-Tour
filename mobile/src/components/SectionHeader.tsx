import { tokens, uiType, uiWeight } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import CountBadge from "./CountBadge";
import PressableScale from "./PressableScale";

export interface SectionHeaderProps {
  title: string;
  count?: number;
  actionLabel?: string;
  onPressAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Section title between cards: bold title + optional dark count badge +
 * optional right-aligned "Xem tất cả ›" link.
 *
 * ```
 * Cần xử lý (3)                         Xem tất cả ›
 * ```
 */
const SectionHeader = ({ title, count, actionLabel, onPressAction, style }: SectionHeaderProps) => (
  <View style={[styles.row, style]}>
    <View style={styles.titleRow}>
      <Text style={uiType.section}>{title}</Text>
      {count !== undefined && <CountBadge count={count} />}
    </View>
    {actionLabel && onPressAction && (
      <PressableScale onPress={onPressAction} style={styles.action} hitSlop={8}>
        <Text style={styles.actionText}>{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={14} color={tokens.colors.primary} />
      </PressableScale>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  action: { flexDirection: "row", alignItems: "center", gap: 2 },
  actionText: {
    color: tokens.colors.primary,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: uiWeight.semibold,
  },
});

export default SectionHeader;
