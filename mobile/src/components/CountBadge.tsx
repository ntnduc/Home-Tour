import { tokens, uiColors, uiRadius, uiWeight } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type CountBadgeTone = "ink" | "primary" | "error" | "alert";
export type CountBadgeSize = "sm" | "md";

export interface CountBadgeProps {
  count: number;
  tone?: CountBadgeTone;
  /** sm 18 (icon overlays, white ring) · md 22 (section headers). */
  size?: CountBadgeSize;
  /** Values above `max` render as "max+" (default 99). */
  max?: number;
  /** Optional leading icon (11px, onInverse). Intended for size "md". */
  icon?: IoniconName;
  style?: StyleProp<ViewStyle>;
}

const TONE_BG: Record<CountBadgeTone, string> = {
  ink: uiColors.ink,
  primary: tokens.colors.primary,
  error: tokens.colors.error,
  alert: tokens.colors.secondary,
};

/**
 * Small solid count badge (section headers, tab/notification counters).
 * Renders nothing when `count <= 0`.
 *
 * ```
 * ╭────╮  min 22×22 · radius pill · 11 bold white
 * │ 12 │
 * ╰────╯  sm: 18×18 · 9 bold · 2px white ring (overlay on icons)
 *
 * With icon (md):
 * ╭────────╮  flexDirection row · gap 2
 * │⚡ 3   │  icon 11 onInverse + count text
 * ╰────────╯
 * ```
 */
const CountBadge = ({
  count,
  tone = "ink",
  size = "md",
  max = 99,
  icon,
  style,
}: CountBadgeProps) => {
  if (count <= 0) return null;

  const countText = count > max ? `${max}+` : count;

  return (
    <View
      style={[
        styles.badge,
        size === "sm" && styles.sm,
        icon && styles.withIcon,
        { backgroundColor: TONE_BG[tone] },
        style,
      ]}
    >
      {icon && (
        <Ionicons name={icon} size={11} color={tokens.colors.onInverse} />
      )}
      <Text style={[styles.text, size === "sm" && styles.textSm]}>
        {countText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: uiRadius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  sm: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: uiColors.card,
  },
  withIcon: {
    flexDirection: "row",
    gap: 2,
  },
  text: {
    color: tokens.colors.onInverse,
    fontSize: 11,
    fontWeight: uiWeight.bold,
  },
  textSm: {
    fontSize: 9,
  },
});

export default CountBadge;
