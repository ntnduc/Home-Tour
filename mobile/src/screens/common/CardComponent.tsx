import Card from "@/components/Card";
import {
  CARD_ACTION_PRESETS,
  isCardActionPresetKey,
} from "@/components/CardActionsPresets";
import IconButton from "@/components/IconButton";
import { IconTone } from "@/components/IconSquircle";
import PressableScale from "@/components/PressableScale";
import StatusBadge from "@/components/StatusBadge";
import { StatusBadgeSpec, uiType } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type CardActionConfig = {
  /** Preset key (`view` | `renew` | `terminate` | `edit` | `delete`) or a custom key. */
  key: string;
  disabled?: boolean;
  /** Custom icon (non-preset keys). */
  icon?: IoniconName;
  tone?: IconTone | "ink";
  label?: string;
  onPress?: () => void;
  /** Fully custom element rendered in the action slot. */
  customButton?: React.ReactNode;
};


export type CardComponentProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** @deprecated layout spacing only (e.g. "mt-3"); prefer list `gap`. */
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  descriptionStyle?: StyleProp<TextStyle>;
  actions?: (CardActionConfig | string)[];
  renderActions?: () => React.ReactNode;
  topContent?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onActionPress?: (key: string) => void;
  /** Makes the header + body pressable (actions stay separate touchables). */
  onPress?: () => void;
  /** Label + tone; the card renders a `StatusBadge`. */
  statusBadge?: StatusBadgeSpec;
};

/**
 * Generic content card (Modern Minimalist) built on `Card`.
 *
 * ```
 * ┌──────────────────────────────────────────────┐ Card soft · radius 24 · padding 16
 * │ topContent (optional notice)                 │
 * │ Title (17/24 bold)           [● Badge]       │  StatusBadge
 * │ description (caption)        (◉)(◉)(◉)       │  IconButton sm per action
 * │ children                                     │
 * │ footer                                       │
 * └──────────────────────────────────────────────┘
 * ```
 */
const CardComponent = ({
  children,
  style,
  className,
  title,
  description,
  descriptionStyle,
  actions,
  renderActions,
  topContent,
  header,
  footer,
  onActionPress,
  onPress,
  statusBadge,
}: CardComponentProps) => {
  const visibleActions = (actions ?? [])
    .map((action) => (typeof action === "string" ? { key: action } : action))
    .filter((action) => !action.disabled);

  const hasActions = visibleActions.length > 0 || !!renderActions;
  const hasHeader =
    header !== undefined ||
    !!title ||
    !!statusBadge ||
    visibleActions.length > 0 ||
    !!renderActions;

  const renderAction = (action: CardActionConfig) => {
    if (action.customButton) {
      return <View key={action.key}>{action.customButton}</View>;
    }
    const preset = isCardActionPresetKey(action.key)
      ? CARD_ACTION_PRESETS[action.key]
      : undefined;
    const icon = action.icon ?? preset?.icon ?? "ellipsis-horizontal";
    const label = action.label ?? preset?.label ?? action.key;
    return (
      <IconButton
        key={action.key}
        icon={icon}
        tone={action.tone ?? preset?.tone ?? "ink"}
        size="sm"
        accessibilityLabel={label}
        onPress={() => {
          action.onPress?.();
          onActionPress?.(action.key);
        }}
      />
    );
  };

  const headerContent =
    header !== undefined ? (
      header
    ) : hasHeader ? (
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          {typeof title === "string" ? (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          ) : (
            title
          )}
          {typeof description === "string" ? (
            <Text style={[uiType.caption, descriptionStyle]}>{description}</Text>
          ) : (
            description
          )}
        </View>
        {(statusBadge || hasActions) && (
          <View style={styles.trailingCol}>
            {statusBadge && (
              <StatusBadge label={statusBadge.label} tone={statusBadge.tone} />
            )}
            {hasActions && (
              <View style={styles.actionsRow}>
                {visibleActions.map(renderAction)}
                {renderActions?.()}
              </View>
            )}
          </View>
        )}
      </View>
    ) : null;

  const main = (
    <>
      {headerContent}
      {children !== undefined && children !== null && <View>{children}</View>}
    </>
  );

  const card = (
    <Card style={[styles.card, style]}>
      {topContent}
      {onPress ? (
        <PressableScale onPress={onPress} scaleTo={0.98} style={styles.main}>
          {main}
        </PressableScale>
      ) : (
        <View style={styles.main}>{main}</View>
      )}
      {footer ? <View>{footer}</View> : null}
    </Card>
  );

  return className ? <View className={className}>{card}</View> : card;
};

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  main: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...uiType.section,
    fontSize: 17,
    lineHeight: 24,
  },
  trailingCol: {
    alignItems: "flex-end",
    gap: 8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
});

export default CardComponent;
