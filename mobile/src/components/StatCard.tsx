import { uiType } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import Card from "./Card";
import IconSquircle, { IconTone } from "./IconSquircle";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface StatCardProps {
  icon: IoniconName;
  label: string;
  value: string | number;
  tone?: IconTone;
  /** Optional caption under the value (trend, unit…). */
  hint?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * KPI tile (raised card) — same language as the Dashboard bento.
 *
 * ```
 * ┌───────────────────┐ Card medium · radius 24
 * │ ▣                 │ IconSquircle sm (tone)
 * │ 12,5 tr           │ title 24/36 bold
 * │ Doanh thu tháng   │ caption
 * └───────────────────┘
 * ```
 */
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, tone = "primary", hint, style }) => (
  <Card elevation="medium" style={[styles.card, style]}>
    <IconSquircle icon={icon} tone={tone} size="sm" />
    <Text style={[uiType.title, styles.value]} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
    <Text style={uiType.caption} numberOfLines={2}>
      {label}
    </Text>
    {hint ? <Text style={uiType.caption}>{hint}</Text> : null}
  </Card>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    gap: 4,
  },
  value: {
    marginTop: 8,
  },
});

export default StatCard;
