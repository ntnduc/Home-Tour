import { uiType } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import Button from "./Button";
import Card from "./Card";
import IconSquircle from "./IconSquircle";

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
 * ```
 * ┌─────────────────────────────┐ Card soft · radius 24 · padding 22
 * │            ▣                │ IconSquircle lg (neutral)
 * │      Title Text Center      │ section 18/28
 * │    Description (optional)   │ body muted center
 * │      [ + Thêm tài sản ]     │ Button soft (optional)
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
  <Card padding="lg" style={[styles.card, style]}>
    <IconSquircle icon={icon} tone="neutral" size="lg" />
    <Text style={[uiType.section, styles.center]}>{title}</Text>
    {description && <Text style={[uiType.body, styles.description]}>{description}</Text>}
    {actionLabel && onPressAction && (
      <Button
        label={actionLabel}
        icon="add"
        variant="soft"
        onPress={onPressAction}
        style={styles.action}
      />
    )}
  </Card>
);

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: 12,
  },
  center: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    color: uiType.caption.color,
  },
  action: {
    marginTop: 4,
  },
});

export default EmptyState;
