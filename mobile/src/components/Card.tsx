import { shadows, uiColors, uiRadius, uiSpace } from "@/theme";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import PressableScale from "./PressableScale";

export type CardElevation = "flat" | "soft" | "medium";
export type CardPadding = "none" | "md" | "lg";

export interface CardProps {
  children: React.ReactNode;
  /** Depth tier: flat (no shadow), soft (default, list/content cards), medium (raised/KPI). */
  elevation?: CardElevation;
  padding?: CardPadding;
  /** Makes the whole card pressable (spring 0.97). Keep inner actions OUTSIDE pressable areas. */
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const PADDING: Record<CardPadding, number> = {
  none: 0,
  md: uiSpace.card,
  lg: uiSpace.hero,
};

/**
 * Base surface card — white, radius 24, layered shadow (never borders).
 *
 * ```
 * ┌───────────────────────────┐  bg surface · radius 24 · shadow soft|medium
 * │ children (padding 16)     │
 * └───────────────────────────┘
 * ```
 */
const Card = ({
  children,
  elevation = "soft",
  padding = "md",
  onPress,
  accessibilityLabel,
  style,
}: CardProps) => {
  const cardStyle = [
    styles.card,
    elevation !== "flat" && shadows[elevation],
    { padding: PADDING[padding] },
    style,
  ];

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        scaleTo={0.97}
        accessibilityLabel={accessibilityLabel}
        style={cardStyle}
      >
        {children}
      </PressableScale>
    );
  }
  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: uiColors.card,
    borderRadius: uiRadius.card,
  },
});

export default Card;
