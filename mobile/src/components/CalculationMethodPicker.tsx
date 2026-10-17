import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from "@/constant/service.constant";
import { tokens, uiColors, uiRadius, uiType, uiWeight } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import IconButton from "./IconButton";
import IconSquircle from "./IconSquircle";
import PressableScale from "./PressableScale";

interface CalculationMethodPickerProps {
  value: ServiceCalculateMethod;
  onChange: (value: ServiceCalculateMethod) => void;
}

/**
 * Service calculation-method picker (collapsed by default).
 *
 * ```
 * CÁCH TÍNH TIỀN
 * ╭───────────────────────────────────────╮ selected: primary-muted tile
 * │ ▣  Cố định theo phòng            (ⓘ)  │
 * ╰───────────────────────────────────────╯
 *  ▣  Cố định theo người            (ⓘ)    other methods (expanded)
 *            Xem thêm ⌄
 * ```
 */
const CalculationMethodPicker = ({ value, onChange }: CalculationMethodPickerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const showInfo = (method: ServiceCalculateMethod) =>
    Alert.alert("Thông tin", SERVICE_CALCULATE_METHOD_WITH_INFO[method].info);

  const renderOption = (method: ServiceCalculateMethod, selected: boolean) => {
    const info = SERVICE_CALCULATE_METHOD_WITH_INFO[method];
    return (
      <PressableScale
        key={method}
        onPress={() => {
          onChange(method);
          setIsExpanded(false);
        }}
        scaleTo={0.98}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        style={[styles.option, selected && styles.optionSelected]}
      >
        <IconSquircle icon={info.icon} tone={selected ? "primary" : "neutral"} size="sm" />
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]} numberOfLines={1}>
          {info.label}
        </Text>
        <IconButton
          icon="information-circle-outline"
          tone={selected ? "primary" : "neutral"}
          size="sm"
          onPress={() => showInfo(method)}
          accessibilityLabel={`Giải thích: ${info.label}`}
        />
      </PressableScale>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={uiType.eyebrow}>Cách tính tiền</Text>
      {renderOption(value, true)}
      {isExpanded &&
        Object.values(ServiceCalculateMethod)
          .filter((method) => method !== value && SERVICE_CALCULATE_METHOD_WITH_INFO[method])
          .map((method) => renderOption(method, false))}
      <PressableScale
        onPress={() => setIsExpanded(!isExpanded)}
        hitSlop={8}
        style={styles.expand}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        <Text style={styles.expandText}>{isExpanded ? "Thu gọn" : "Xem thêm"}</Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={tokens.colors.primary}
        />
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    borderRadius: uiRadius.field,
    backgroundColor: uiColors.card,
  },
  optionSelected: {
    backgroundColor: tokens.colors.primaryMuted,
  },
  optionLabel: {
    ...uiType.body,
    flex: 1,
  },
  optionLabelSelected: {
    fontWeight: uiWeight.semibold,
    color: tokens.colors.primary,
  },
  expand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  expandText: {
    fontSize: 13,
    fontWeight: uiWeight.semibold,
    color: tokens.colors.primary,
  },
});

export default CalculationMethodPicker;
