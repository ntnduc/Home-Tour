import DisplayPhoneNumber from "@/components/DisplayPhoneNumber";
import { uiColors, uiType, uiWeight } from "@/theme";
import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

type DisplayFieldType = "text" | "phone";

type Props = {
  label: string;
  value?: string | number | React.ReactNode;
  /** Emphasise the value (semibold ink). */
  strong?: boolean;
  type?: DisplayFieldType;
  direction?: "horizontal" | "vertical";
  /** Cross-axis alignment for vertical fields (e.g. right column → "end"). */
  align?: "start" | "end";
  /** Remove the default bottom spacing (when the parent uses `gap`). */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
};

/**
 * Read-only label/value row for detail screens.
 *
 * ```
 * horizontal:  Label ··························· Value
 * vertical:    LABEL (caption)
 *              Value
 * ```
 */
const DisplayField = ({
  label,
  value,
  strong = false,
  type = "text",
  direction = "horizontal",
  align = "start",
  compact = false,
  style,
  valueStyle,
}: Props) => {
  const fallbackValue = value ?? "-";
  const isHorizontal = direction === "horizontal";
  const textStyle = [styles.value, strong && styles.valueStrong, valueStyle];

  const renderValue = () => {
    if (React.isValidElement(fallbackValue)) return fallbackValue;
    if (type === "phone" && typeof fallbackValue === "string") {
      return <DisplayPhoneNumber style={textStyle}>{fallbackValue}</DisplayPhoneNumber>;
    }
    return <Text style={[textStyle, isHorizontal && styles.valueRight]}>{fallbackValue}</Text>;
  };

  return (
    <View
      style={[
        isHorizontal ? styles.horizontal : styles.vertical,
        !isHorizontal && align === "end" && styles.alignEnd,
        !compact && styles.spacing,
        style,
      ]}
    >
      <Text style={isHorizontal ? styles.label : uiType.caption}>{label}</Text>
      {renderValue()}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  vertical: {
    gap: 2,
    alignItems: "flex-start",
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  spacing: {
    marginBottom: 8,
  },
  label: {
    ...uiType.body,
    color: uiColors.textMuted,
  },
  value: {
    ...uiType.body,
    color: uiColors.ink,
  },
  valueStrong: {
    fontWeight: uiWeight.semibold,
  },
  valueRight: {
    flexShrink: 1,
    textAlign: "right",
  },
});

export default DisplayField;
