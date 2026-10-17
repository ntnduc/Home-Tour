import { uiRadius, uiType, uiWeight } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { ICON_TONE } from "./IconSquircle";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type NoticeTone = "error" | "warning" | "info" | "success" | "neutral";

export interface NoticeBannerProps {
  message: string;
  /** Optional bold first line. */
  title?: string;
  tone?: NoticeTone;
  icon?: IoniconName;
  /** Extra content under the message (bullet list, link…). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_ICON: Record<NoticeTone, IoniconName> = {
  error: "alert-circle",
  warning: "warning",
  info: "information-circle",
  success: "checkmark-circle",
  neutral: "information-circle-outline",
};

/**
 * Inline tinted notice (warnings, hints, confirmations) — no borders, tone surface.
 *
 * ```
 * ╭──────────────────────────────────────────╮ radius 16 · bg tone surface
 * │ ⚠  Title (semibold, tone color)          │
 * │    Message (body, tone color)            │
 * ╰──────────────────────────────────────────╯
 * ```
 */
const NoticeBanner = ({
  message,
  title,
  tone = "info",
  icon,
  children,
  style,
}: NoticeBannerProps) => {
  const colors = ICON_TONE[tone];
  return (
    <View style={[styles.banner, { backgroundColor: colors.bg }, style]}>
      <Ionicons name={icon ?? DEFAULT_ICON[tone]} size={18} color={colors.color} />
      <View style={styles.body}>
        {title ? <Text style={[styles.title, { color: colors.color }]}>{title}</Text> : null}
        <Text style={[uiType.body, { color: colors.color }]}>{message}</Text>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: uiRadius.icon,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...uiType.body,
    fontWeight: uiWeight.semibold,
  },
});

export default NoticeBanner;
