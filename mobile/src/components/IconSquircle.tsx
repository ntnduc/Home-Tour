import { tokens, uiColors, uiRadius } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type IconTone = "primary" | "neutral" | "success" | "warning" | "error" | "info";
export type IconSquircleSize = "sm" | "md" | "lg";

export interface IconSquircleProps {
  icon: IoniconName;
  tone?: IconTone;
  size?: IconSquircleSize;
  style?: StyleProp<ViewStyle>;
}

/** Tone → background surface + icon color (semantic tokens only). */
export const ICON_TONE: Record<IconTone, { bg: string; color: string }> = {
  primary: { bg: tokens.colors.primaryMuted, color: tokens.colors.primary },
  neutral: { bg: uiColors.canvas, color: uiColors.textSubtle },
  success: { bg: tokens.colors.successSurface, color: tokens.colors.success },
  warning: { bg: tokens.colors.warningSurface, color: tokens.palette.amber[500] },
  error: { bg: tokens.colors.errorSurface, color: tokens.colors.error },
  info: { bg: tokens.colors.infoSurface, color: tokens.colors.info },
};

const SIZE = {
  sm: { box: 36, radius: uiRadius.iconSm, icon: 18 },
  md: { box: 44, radius: uiRadius.icon, icon: 20 },
  lg: { box: 56, radius: uiRadius.tile, icon: 26 },
} as const;

/**
 * Icon inside a tinted squircle — the leading visual of cards, rows and sections.
 *
 * sm 36/r12 (section headers, rows) · md 44/r16 (cards) · lg 56/r20 (empty states)
 */
const IconSquircle = ({ icon, tone = "primary", size = "md", style }: IconSquircleProps) => {
  const s = SIZE[size];
  const t = ICON_TONE[tone];
  return (
    <View
      style={[
        styles.box,
        { width: s.box, height: s.box, borderRadius: s.radius, backgroundColor: t.bg },
        style,
      ]}
    >
      <Ionicons name={icon} size={s.icon} color={t.color} />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

export default IconSquircle;
