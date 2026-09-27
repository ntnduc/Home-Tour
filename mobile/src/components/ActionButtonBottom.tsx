import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ActionButton {
  label: string;
  onPress: () => void | Promise<void>;
  icon?: keyof typeof Ionicons.glyphMap;
  iconElement?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  isLoading?: boolean;
  disabled?: boolean;
  customStyle?: ViewStyle;
  hidden?: boolean | ((action: any) => boolean);
}

// A row can be a single button (rendered full-width) or an array of buttons
// that should be rendered side by side on the same row.
type ActionButtonRow = ActionButton | ActionButton[];

interface ActionButtonBottomProps {
  actions: ActionButtonRow[];
  containerStyle?: ViewStyle;
  className?: string;
  bottomInsetOffset?: number;
}

const isActionHidden = (action: ActionButton, allActions: ActionButton[]) => {
  if (typeof action.hidden === "function") {
    return action.hidden(allActions);
  }
  return !!action.hidden;
};

const getButtonStyle = (
  variant: ActionButton["variant"] = "primary",
  customStyle?: ViewStyle,
) => {
  const baseStyle =
    "flex-row items-center justify-center py-4 px-6 rounded-xl shadow-sm";

  const variantStyles = {
    primary: "bg-blue-600 shadow-[0_1px_5px_rgb(0,0,0,0.12)]",
    secondary: "bg-amber-500 shadow-[0_1px_5px_rgb(0,0,0,0.12)]",
    danger: "bg-red-500 shadow-[0_1px_5px_rgb(0,0,0,0.12)]",
    success: "bg-green-600 shadow-[0_1px_5px_rgb(0,0,0,0.12)]",
  };

  return `${baseStyle} ${variantStyles[variant]} ${customStyle || ""}`;
};

const getTextStyle = (variant: ActionButton["variant"] = "primary") => {
  const baseStyle = "font-semibold text-base ml-2 ";

  const variantStyles = {
    primary: "text-white",
    secondary: "text-white",
    danger: "text-white",
    success: "text-white",
  };

  return `${baseStyle} ${variantStyles[variant]}`;
};

const getIconColor = (variant: ActionButton["variant"] = "primary") => {
  const colors = {
    primary: "#FFFFFF",
    secondary: "#FFFFFF",
    danger: "#FFFFFF",
    success: "#FFFFFF",
  };
  return colors[variant];
};

const ActionButtonBottom: React.FC<ActionButtonBottomProps> = ({
  actions,
  containerStyle,
  className,
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

  return (
    <View
      className={`bg-white border-t border-gray-200 px-6 pt-3 ${className}`}
      style={[
        { backgroundColor: "#fff" },
        containerStyle,
        { paddingBottom: bottom + bottomInsetOffset },
      ]}
    >
      {visibleRows.map((row, rowIndex) => {
        const isMultiButtonRow = row.length > 1;
        return (
          <View
            key={`row-${rowIndex}`}
            className={isMultiButtonRow ? "flex-row" : undefined}
            style={[rowIndex !== visibleRows.length - 1 && { marginBottom: 12 }]}
          >
            {row.map((action, actionIndex) => (
              <TouchableOpacity
                key={`${action.label}-${actionIndex}`}
                className={getButtonStyle(action.variant, action.customStyle)}
                onPress={action.onPress}
                disabled={action.disabled || action.isLoading}
                style={[
                  isMultiButtonRow && { flex: 1 },
                  isMultiButtonRow &&
                    actionIndex !== row.length - 1 && { marginRight: 12 },
                ]}
              >
                {action.isLoading ? (
                  <ActivityIndicator
                    color={getIconColor(action.variant)}
                    size="small"
                  />
                ) : action.iconElement ? (
                  action.iconElement
                ) : (
                  action.icon && (
                    <Ionicons
                      name={action.icon}
                      size={18}
                      color={getIconColor(action.variant)}
                    />
                  )
                )}
                <Text className={getTextStyle(action.variant)}>
                  {action.isLoading ? "Đang xử lý..." : action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </View>
  );
};

export default ActionButtonBottom;
