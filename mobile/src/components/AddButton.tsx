import { tokens, shadows } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import PressableScale from "./PressableScale";

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
 * "+ Thêm" button — reusable create action for any list screen.
 *
 * Variants:
 * - **solid** (default): high contrast, `colors.primary` bg, used in headers
 * - **soft**: muted, `colors.primaryMuted` bg, used inline
 *
 * Dimensions:
 * - height 40 · paddingHorizontal 16 · radius pill (999)
 * - icon 18 · label 14/20 weight 600 · gap 6
 * - shadow soft · scaleTo 0.94 on press
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
}: AddButtonProps) => {
  const isSolid = variant === "solid";
  const combinedAccessibilityLabel = accessibilityLabel || label;

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
      accessibilityLabel={combinedAccessibilityLabel}
      style={[
        styles.button,
        isSolid ? styles.solid : styles.soft,
        isSolid && shadows.soft,
        style,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={isSolid ? tokens.colors.onPrimary : tokens.colors.primary}
      />
      <Text
        style={[styles.label, isSolid ? styles.labelSolid : styles.labelSoft]}
      >
        {label}
      </Text>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  solid: {
    backgroundColor: tokens.colors.primary,
  },
  soft: {
    backgroundColor: tokens.colors.primaryMuted,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  labelSolid: {
    color: tokens.colors.onPrimary,
  },
  labelSoft: {
    color: tokens.colors.primary,
  },
});

export default AddButton;
