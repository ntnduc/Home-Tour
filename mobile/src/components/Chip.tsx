import { tokens, uiColors, uiRadius, uiWeight } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import PressableScale from "./PressableScale";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type ChipVariant = "neutral" | "primary" | "outline";

export interface ChipProps {
  label: string;
  icon?: IoniconName;
  variant?: ChipVariant;
  /** Filter-chip mode: selected chips render solid ink. */
  selected?: boolean;
  /** When set, the chip becomes a touchable filter chip. */
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Meta / filter chip — Modern Minimalist.
 *
 * ```
 * ╭──────────────╮  meta:   height 26 · icon 12 · caption 12/16 (static info)
 * │ ≡  3 tầng    │  filter: height 36 · label 13 semibold (onPress set)
 * ╰──────────────╯          selected → ink bg + white text
 * ```
 */
const Chip = ({
  label,
  icon,
  variant = "neutral",
  selected = false,
  onPress,
  accessibilityLabel,
  style,
}: ChipProps) => {
  const isFilter = !!onPress;
  const textColor = selected
    ? tokens.colors.onInverse
    : variant === "primary"
      ? tokens.colors.primary
      : isFilter
        ? uiColors.ink
        : uiColors.textMuted;

  const content = (
    <>
      {icon && <Ionicons name={icon} size={isFilter ? 14 : 12} color={textColor} />}
      <Text
        style={[isFilter ? styles.filterLabel : styles.metaLabel, { color: textColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </>
  );

  const chipStyle = [
    styles.base,
    isFilter ? styles.filter : styles.meta,
    styles[variant],
    selected && styles.selected,
    style,
  ];

  if (isFilter) {
    return (
      <PressableScale
        onPress={onPress}
        scaleTo={0.94}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={chipStyle}
      >
        {content}
      </PressableScale>
    );
  }
  return <View style={chipStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: uiRadius.pill,
  },
  meta: {
    height: 26,
    paddingHorizontal: 10,
    gap: 4,
  },
  filter: {
    height: 36,
    paddingHorizontal: 14,
    gap: 6,
  },
  neutral: {
    backgroundColor: uiColors.canvas,
  },
  primary: {
    backgroundColor: tokens.colors.primaryMuted,
  },
  outline: {
    backgroundColor: uiColors.card,
    borderWidth: 1,
    borderColor: uiColors.hairline,
  },
  selected: {
    backgroundColor: uiColors.ink,
    borderColor: uiColors.ink,
  },
  metaLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  filterLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: uiWeight.semibold,
  },
});

export default Chip;
