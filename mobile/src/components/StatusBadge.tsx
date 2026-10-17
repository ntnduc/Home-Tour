import { STATUS_TONE_COLOR, StatusTone, uiRadius, uiWeight } from "@/theme";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

export type { StatusTone };

export type StatusBadgeSize = "sm" | "md";

export interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  size?: StatusBadgeSize;
  /** Leading color dot (default true). */
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Status pill — Modern Minimalist.
 *
 * ```
 * ╭──────────────╮  height 26 (sm 22) · radius pill · bg tone surface
 * │ ● Đang thuê  │  dot 6 · label 12/16 semibold · tone color
 * ╰──────────────╯
 * ```
 */
const StatusBadge = ({
  label,
  tone = "neutral",
  size = "md",
  showDot = true,
  style,
}: StatusBadgeProps) => {
  const { bg, color } = STATUS_TONE_COLOR[tone];
  return (
    <View
      style={[styles.base, size === "sm" ? styles.sm : styles.md, { backgroundColor: bg }, style]}
    >
      {showDot && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[styles.label, size === "sm" && styles.labelSm, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: uiRadius.pill,
    flexShrink: 0,
  },
  md: {
    height: 26,
    paddingHorizontal: 10,
    gap: 6,
  },
  sm: {
    height: 22,
    paddingHorizontal: 8,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: uiWeight.semibold,
  },
  labelSm: {
    fontSize: 11,
    lineHeight: 14,
  },
});

export default StatusBadge;
