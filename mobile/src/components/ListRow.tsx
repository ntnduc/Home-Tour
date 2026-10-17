import { tokens, uiColors, uiType, uiWeight } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import IconSquircle, { IconTone } from "./IconSquircle";
import PressableScale from "./PressableScale";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Leading IconSquircle (sm). */
  icon?: IoniconName;
  iconTone?: IconTone;
  /** `chevron` (navigation), `check` (shown when selected) or a custom element. */
  trailing?: "chevron" | "check" | ReactNode;
  selected?: boolean;
  /** Destructive rows (logout, delete) render title in error color. */
  destructive?: boolean;
  /** Hairline above the row (for rows after the first inside a card). */
  divider?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Tappable list row — menus, pickers inside sheets, settings.
 *
 * ```
 * ─────────────────────────────────────────────  hairline (divider)
 *  ▣  Title (14/20 semibold)                  ›   chevron | ✓ | custom
 *     Subtitle (caption)
 * ```
 * Selected rows get a primary tint + check.
 */
const ListRow = ({
  title,
  subtitle,
  icon,
  iconTone = "primary",
  trailing,
  selected = false,
  destructive = false,
  divider = false,
  onPress,
  style,
}: ListRowProps) => {
  const titleColor = destructive
    ? tokens.colors.error
    : selected
      ? tokens.colors.primary
      : uiColors.ink;

  const trailingNode =
    trailing === "chevron" ? (
      <Ionicons name="chevron-forward" size={18} color={uiColors.textSubtle} />
    ) : trailing === "check" ? (
      selected ? <Ionicons name="checkmark-circle" size={20} color={tokens.colors.primary} /> : null
    ) : (
      trailing
    );

  const content = (
    <>
      {icon && <IconSquircle icon={icon} tone={destructive ? "error" : iconTone} size="sm" />}
      <View style={styles.body}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={uiType.caption} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailingNode}
    </>
  );

  const rowStyle = [styles.row, divider && styles.divider, selected && styles.selected, style];

  if (!onPress) return <View style={rowStyle}>{content}</View>;
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={rowStyle}
    >
      {content}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.borderStrong,
  },
  selected: {
    backgroundColor: tokens.colors.primaryMuted,
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

export default ListRow;
