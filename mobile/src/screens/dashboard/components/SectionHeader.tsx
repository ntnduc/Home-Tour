import { tokens } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { HOME_RADIUS, homeColors, homeType, homeWeight } from "../homeStyles";
import PressableScale from "./PressableScale";

type Props = {
  title: string;
  count?: number;
  actionLabel?: string;
  onPressAction?: () => void;
};

/** Tiêu đề section: chữ đậm + badge đếm (tùy chọn) + liên kết "Xem tất cả" căn phải. */
const SectionHeader = ({ title, count, actionLabel, onPressAction }: Props) => (
  <View style={styles.row}>
    <View style={styles.titleRow}>
      <Text style={homeType.section}>{title}</Text>
      {count !== undefined && count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </View>
    {actionLabel && onPressAction && (
      <PressableScale onPress={onPressAction} style={styles.action} hitSlop={8}>
        <Text style={styles.actionText}>{actionLabel}</Text>
        <Ionicons
          name="chevron-forward"
          size={14}
          color={tokens.colors.primary}
        />
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
  countBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: HOME_RADIUS.pill,
    backgroundColor: homeColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: tokens.colors.onInverse,
    fontSize: 11,
    fontWeight: homeWeight.bold,
  },
  action: { flexDirection: "row", alignItems: "center", gap: 2 },
  actionText: {
    color: tokens.colors.primary,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: homeWeight.semibold,
  },
});

export default SectionHeader;
