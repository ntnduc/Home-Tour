import { uiColors, uiSpace } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button, { ButtonVariant } from "./Button";

type ActionVariant = "primary" | "secondary" | "danger" | "success" | "outline" | "soft";

interface ActionButton {
  label: string;
  onPress: () => void | Promise<void>;
  icon?: keyof typeof Ionicons.glyphMap;
  iconElement?: ReactNode;
  /** `secondary` = warning-colored action (legacy name). */
  variant?: ActionVariant;
  isLoading?: boolean;
  disabled?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  hidden?: boolean | ((actions: ActionButton[]) => boolean);
}

// A row can be a single button (rendered full-width) or an array of buttons
// that should be rendered side by side on the same row.
type ActionButtonRow = ActionButton | ActionButton[];

interface ActionButtonBottomProps {
  actions: ActionButtonRow[];
  containerStyle?: StyleProp<ViewStyle>;
  bottomInsetOffset?: number;
}

const VARIANT: Record<ActionVariant, ButtonVariant> = {
  primary: "primary",
  secondary: "warning",
  danger: "danger",
  success: "success",
  outline: "outline",
  soft: "soft",
};

const isActionHidden = (action: ActionButton, allActions: ActionButton[]) =>
  typeof action.hidden === "function" ? action.hidden(allActions) : !!action.hidden;

/**
 * Sticky bottom action bar (safe-area aware) — Modern Minimalist.
 *
 * ```
 * ─────────────────────────────────────────  soft upward shadow, no border
 * ╭───────────────────────────────────────╮  Button lg (52) per action, pill
 * │            ✓  Cập nhật                │
 * ╰───────────────────────────────────────╯
 * [  Huỷ  ]  [  Xác nhận  ]                  array row → side by side, gap 12
 * ```
 */
const ActionButtonBottom: React.FC<ActionButtonBottomProps> = ({
  actions,
  containerStyle,
  bottomInsetOffset = 0,
}) => {
  const { bottom } = useSafeAreaInsets();

  // Flatten so `hidden` callbacks keep receiving the full list of actions,
  // regardless of whether they were grouped into rows.
  const flatActions = actions.flat();

  const visibleRows = actions
    .map((row) => (Array.isArray(row) ? row : [row]))
    .map((row) => row.filter((action) => !isActionHidden(action, flatActions)))
    .filter((row) => row.length > 0);

  if (visibleRows.length === 0) return null;

  return (
    <View
      style={[
        styles.bar,
        containerStyle,
        { paddingBottom: Math.max(bottom, uiSpace.gap) + bottomInsetOffset },
      ]}
    >
      {visibleRows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((action, actionIndex) => (
            <Button
              key={`${action.label}-${actionIndex}`}
              label={action.label}
              icon={action.icon}
              iconElement={action.iconElement}
              variant={VARIANT[action.variant ?? "primary"]}
              size="lg"
              block
              isLoading={action.isLoading}
              disabled={action.disabled}
              onPress={() => {
                void action.onPress();
              }}
              style={action.customStyle}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: uiColors.card,
    paddingHorizontal: uiSpace.screen,
    paddingTop: uiSpace.gap,
    gap: uiSpace.gap,
    shadowColor: uiColors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flexDirection: "row",
    gap: uiSpace.gap,
  },
});

export default ActionButtonBottom;
