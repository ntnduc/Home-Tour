import { uiColors, uiSpace, uiType } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Card from "./Card";
import IconSquircle, { IconTone } from "./IconSquircle";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface FormSectionProps {
  title: string;
  /** Leading icon; omit for a text-only header. */
  icon?: IoniconName;
  iconTone?: IconTone;
  caption?: string;
  /** Optional element aligned right of the title (e.g. an AddButton, a StatusBadge). */
  action?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Titled content card for forms and detail screens.
 *
 * ```
 * ┌─────────────────────────────────────────────┐ Card soft · radius 24
 * │ ▣ Title                          [action]   │ IconSquircle sm + section title
 * │   caption                                   │
 * │ ─────────────────────────────────────────   │ hairline
 * │ children (gap 12)                           │
 * └─────────────────────────────────────────────┘
 * ```
 */
const FormSection = ({
  title,
  icon,
  iconTone = "primary",
  caption,
  action,
  children,
  style,
}: FormSectionProps) => (
  <Card style={[styles.card, style]}>
    <View style={styles.headerRow}>
      {icon && <IconSquircle icon={icon} tone={iconTone} size="sm" />}
      <View style={styles.titleCol}>
        <Text style={uiType.section} numberOfLines={1}>
          {title}
        </Text>
        {caption ? (
          <Text style={uiType.caption} numberOfLines={2}>
            {caption}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
    <View style={styles.hairline} />
    <View style={styles.body}>{children}</View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleCol: {
    flex: 1,
  },
  hairline: {
    height: 1,
    backgroundColor: uiColors.hairline,
  },
  body: {
    gap: uiSpace.gap,
  },
});

export default FormSection;
