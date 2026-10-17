import { shadows, tokens, uiColors, uiRadius, uiWeight } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import PressableScale from "./PressableScale";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type ButtonVariant =
  | "primary"
  | "soft"
  | "outline"
  | "danger"
  | "dangerSoft"
  | "success"
  | "successSoft"
  | "warning"
  | "warningSoft";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IoniconName;
  /** Custom leading element (overrides `icon`). */
  iconElement?: React.ReactNode;
  isLoading?: boolean;
  /** Label shown while loading (default "Đang xử lý..."). */
  loadingLabel?: string;
  disabled?: boolean;
  /** Stretch to fill the row (flex: 1). */
  block?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/** Variant → background / border / foreground. Solid variants get a soft shadow. */
const VARIANT: Record<
  ButtonVariant,
  { bg: string; fg: string; border?: string; solid: boolean }
> = {
  primary: { bg: tokens.colors.primary, fg: tokens.colors.onPrimary, solid: true },
  soft: { bg: tokens.colors.primaryMuted, fg: tokens.colors.primary, solid: false },
  outline: { bg: uiColors.card, fg: uiColors.ink, border: uiColors.fieldBorder, solid: false },
  danger: { bg: tokens.colors.error, fg: tokens.colors.onPrimary, solid: true },
  dangerSoft: { bg: tokens.colors.errorSurface, fg: tokens.colors.error, solid: false },
  success: { bg: tokens.colors.success, fg: tokens.colors.onPrimary, solid: true },
  successSoft: { bg: tokens.colors.successSurface, fg: tokens.colors.success, solid: false },
  warning: { bg: tokens.palette.amber[500], fg: tokens.colors.onPrimary, solid: true },
  warningSoft: { bg: tokens.colors.warningSurface, fg: tokens.palette.amber[600], solid: false },
};

const SIZE = {
  sm: { height: 36, px: 14, icon: 16, font: 13 },
  md: { height: 44, px: 16, icon: 18, font: 14 },
  lg: { height: 52, px: 20, icon: 20, font: 16 },
} as const;

/**
 * Pill button — the single button primitive of the app.
 *
 * ```
 * ╭─────────────────────╮  sm 36 · md 44 · lg 52 · radius pill
 * │  ✓  Cập nhật        │  icon + label semibold · spinner while loading
 * ╰─────────────────────╯
 * ```
 */
const Button = ({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconElement,
  isLoading = false,
  loadingLabel = "Đang xử lý...",
  disabled = false,
  block = false,
  accessibilityLabel,
  style,
  textStyle,
}: ButtonProps) => {
  const v = VARIANT[variant];
  const s = SIZE[size];
  const isDisabled = disabled || isLoading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      scaleTo={0.96}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.px,
          backgroundColor: v.bg,
          borderColor: v.border ?? v.bg,
        },
        v.solid && !isDisabled && shadows.soft,
        block && styles.block,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={v.fg} />
      ) : (
        iconElement ?? (icon && <Ionicons name={icon} size={s.icon} color={v.fg} />)
      )}
      <Text
        style={[styles.label, { color: v.fg, fontSize: s.font }, textStyle]}
        numberOfLines={1}
      >
        {isLoading ? loadingLabel : label}
      </Text>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: uiRadius.pill,
    borderWidth: 1,
  },
  block: {
    flex: 1,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontWeight: uiWeight.semibold,
  },
});

export default Button;
