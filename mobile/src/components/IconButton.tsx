import { uiColors, uiRadius } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { ICON_TONE, IconTone } from "./IconSquircle";
import PressableScale from "./PressableScale";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type IconButtonSize = "sm" | "md";
export type IconButtonShape = "circle" | "squircle";

export interface IconButtonProps {
  icon: IoniconName;
  onPress: () => void;
  /** Required: icon-only buttons must be labelled for screen readers. */
  accessibilityLabel: string;
  tone?: IconTone | "ink";
  size?: IconButtonSize;
  shape?: IconButtonShape;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZE = {
  sm: { box: 32, icon: 16, hitSlop: 6 },
  md: { box: 40, icon: 18, hitSlop: 4 },
} as const;

/**
 * Icon-only action (edit, delete, close…). Tinted surface by tone, ≥44pt touch
 * target via `hitSlop`, spring press feedback.
 */
const IconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  tone = "ink",
  size = "md",
  shape = "circle",
  disabled = false,
  style,
}: IconButtonProps) => {
  const s = SIZE[size];
  const colors =
    tone === "ink" ? { bg: uiColors.canvas, color: uiColors.ink } : ICON_TONE[tone];
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.92}
      hitSlop={s.hitSlop}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        {
          width: s.box,
          height: s.box,
          borderRadius: shape === "circle" ? uiRadius.pill : uiRadius.iconSm,
          backgroundColor: colors.bg,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Ionicons name={icon} size={s.icon} color={colors.color} />
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
});

export default IconButton;
