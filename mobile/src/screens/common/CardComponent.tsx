import { CARD_ACTION_PRESETS } from "@/components/CardActionsPresets";
import styles from "@/styles/component/CardComponent.styles";
import React from "react";
import {
  GestureResponderEvent,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// import { Pressable } from 'react-native-gesture-handler';

export type CardActionConfig = {
  key: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: any;
  customButton?: React.ReactNode;
};

const STATUS_BADGE_PRESETS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  success: { label: "Thành công", color: "#22C55E", bg: "#F0FDF4" },
  denied: { label: "Từ chối", color: "#EF4444", bg: "#FEF2F2" },
  warning: { label: "Cảnh báo", color: "#D97706", bg: "#FEF3C7" },
  // Thêm loại mới ở đây nếu muốn
};

export type CardComponentProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  descriptionStyle?: StyleProp<any>;
  actions?: (CardActionConfig | string)[];
  renderActions?: () => React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onActionPress?: (key: string) => void;
  classNameBadge?: string;
  statusBadge?: {
    key: string;
    label?: string;
    color?: string;
    bg?: string;
  };
};

const getStatusBadge = (badge?: {
  key: string;
  label?: string;
  color?: string;
  bg?: string;
}) => {
  if (!badge) return undefined;
  if (badge.key === "custom") {
    return {
      label: badge.label || "",
      color: badge.color || "#000",
      bg: badge.bg || "#fff",
    };
  }
  return { ...STATUS_BADGE_PRESETS[badge.key], ...badge };
};

const CardComponent = (props: CardComponentProps) => {
  const {
    children,
    style,
    className,
    title,
    description,
    descriptionStyle,
    actions,
    renderActions,
    header,
    footer,
    onActionPress,
    statusBadge,
    classNameBadge,
  } = props;

  // Helper: build action config từ string preset hoặc object
  const buildAction = (
    action: CardActionConfig | string,
  ): (CardActionConfig & { presetKey?: string }) | null => {
    if (typeof action === "string") {
      const preset = CARD_ACTION_PRESETS[action];
      if (!preset) return null;
      return {
        ...preset(() => onActionPress && onActionPress(action)),
        presetKey: action,
      };
    }
    const preset = CARD_ACTION_PRESETS[action.key];
    const preBuildAction = {
      ...preset(() => onActionPress && onActionPress(action.key)),
      presetKey: action.key,
      ...action,
    };
    return preBuildAction;
  };

  // Helper: lấy style cho action preset
  const getActionStyle = (presetKey?: string, customStyle?: any) => {
    switch (presetKey) {
      case "view":
        return [styles.actionItem, styles.viewButton, customStyle];
      case "renew":
        return [styles.actionItem, styles.renewButton, customStyle];
      case "terminate":
        return [styles.actionItem, styles.terminateButton, customStyle];
      case "edit":
        return [styles.actionItem, styles.editButton, customStyle];
      case "delete":
        return [styles.actionItem, styles.deleteButton, customStyle];
      default:
        return [styles.actionItem, customStyle];
    }
  };

  const filteredActions = actions?.filter((action) => {
    if (typeof action === "string") {
      return true;
    }
    return !action.disabled;
  });

  const badge = getStatusBadge(statusBadge);

  return (
    <View
      style={[styles.card, style]}
      className={`rounded-xl ${className || ""}`}
    >
      {header !== undefined ? (
        header
      ) : title || filteredActions || renderActions ? (
        <View style={styles.header}>
          <View style={{ flexDirection: "row", flex: 1 }} className="mb-3">
            <View style={{ flex: 1 }}>
              {title ? (
                typeof title === "string" ? (
                  <Text style={styles.title}>{title}</Text>
                ) : (
                  title
                )
              ) : null}
              {description &&
                (typeof description === "string" ? (
                  <Text style={[styles.description, descriptionStyle]}>
                    {description}
                  </Text>
                ) : (
                  description
                ))}
            </View>

            {/* Status badge */}
            {/* {badge && (
              <View
                className={classNameBadge || ''}
                style={[styles.statusBadge, { backgroundColor: badge.bg }]}
              >
                <Text style={[styles.statusText, { color: badge.color }]}>
                  {badge.label}
                </Text>
              </View>
            )} */}

            {/* Action button */}
            <View>
              <View className="flex flex-col content-center items-center">
                {badge && (
                  <View
                    className={classNameBadge || ""}
                    style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                  >
                    <Text style={[styles.statusText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.actionsContainer}>
                {filteredActions &&
                  filteredActions.map((action, idx) => {
                    const act = buildAction(action);
                    if (!act) return null;
                    return act.customButton ? (
                      <View key={act.key} style={styles.actionItem}>
                        {act.customButton}
                      </View>
                    ) : (
                      <TouchableOpacity
                        key={act.key}
                        onPress={(e) => {
                          act.onPress?.(e as any);
                        }}
                        style={getActionStyle(
                          (act as any).presetKey,
                          act.style,
                        )}
                        accessibilityLabel={act.label}
                      >
                        {act.icon}
                      </TouchableOpacity>
                    );
                  })}
                {renderActions && renderActions()}
              </View>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.body}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
};

export default CardComponent;
