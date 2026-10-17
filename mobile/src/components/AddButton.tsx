import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Button from "./Button";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface AddButtonProps {
  onPress: () => void;
  label?: string;
  icon?: IoniconName;
  variant?: "solid" | "soft";
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * "+ Thêm" button — create action for list headers (solid) and inline sections (soft).
 * Thin preset over `Button` (size md, pill).
 *
 * @default `label = "Thêm"`, `icon = "add"`, `variant = "solid"`
 */
const AddButton = ({
  onPress,
  label = "Thêm",
  icon = "add",
  variant = "solid",
  accessibilityLabel,
  style,
}: AddButtonProps) => (
  <Button
    label={label}
    icon={icon}
    onPress={onPress}
    variant={variant === "solid" ? "primary" : "soft"}
    accessibilityLabel={accessibilityLabel}
    style={style}
  />
);

export default AddButton;
