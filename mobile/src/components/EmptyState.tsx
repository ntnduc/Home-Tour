import { tokens, shadows } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import PressableScale from "./PressableScale";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface EmptyStateProps {
  icon: IoniconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Empty state card — displays when a list/section has no data.
 *
 * Layout:
 * ```
 * ┌─────────────────────────────┐
 * │  ┌───────────────────────┐  │
 * │  │  ▭ (icon squircle)    │  │  56×56 radius 20 bg surfaceMuted
 * │  │   [icon]              │  │  26px icon, subtle color
 * │  └───────────────────────┘  │
 * │                             │
 * │      Title Text Center      │  16/24 w700 gray[900]
 * │    Description (optional)   │  14/20 muted center
 * │                             │
 * │    [Thêm tài sản] (opt)     │  soft variant AddButton
 * └─────────────────────────────┘
 * ```
 */
const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onPressAction,
  style,
}: EmptyStateProps) => (
  <View style={[styles.card, shadows.soft, style]}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={26} color={tokens.colors.subtle} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
    {actionLabel && onPressAction && (
      <PressableScale
        onPress={onPressAction}
        scaleTo={0.94}
        style={styles.actionButton}
      >
        <Ionicons name="add" size={16} color={tokens.colors.primary} />
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </PressableScale>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: tokens.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: tokens.typography.fontSize.lg,
    lineHeight: tokens.typography.lineHeight.lg,
    fontWeight: "700",
    color: tokens.palette.gray[900],
    textAlign: "center",
  },
  description: {
    fontSize: tokens.typography.fontSize.sm,
    lineHeight: tokens.typography.lineHeight.sm,
    color: tokens.colors.muted,
    textAlign: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: tokens.colors.primaryMuted,
    marginTop: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.primary,
  },
});

export default EmptyState;
