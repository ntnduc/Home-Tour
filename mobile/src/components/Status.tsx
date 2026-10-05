import { tokens } from "@/theme";
import React, { useCallback } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

export type StatusType = "success" | "warning" | "error" | "info" | "default";

export type StatusOption = {
  value: any;
  label: string;
  type?: StatusType;
  className?: string;
  textClassName?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

type Props = {
  type?: StatusType;
  label?: string;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  className?: string;
  textClassName?: string;
  options?: StatusOption[];
  value?: any;
};

const Status = ({
  type,
  label,
  style,
  containerStyle,
  className,
  textClassName,
  options,
  value,
}: Props) => {
  const _renderOption = useCallback(
    (option: Props[], value: any) => {
      if (!value) return <View></View>;
      const selectedOption = options?.find((option) => option.value === value);
      if (!selectedOption) return <View></View>;

      return (
        <View
          style={[
            styles.container,
            styles[selectedOption.type ?? "default"],
            containerStyle,
            selectedOption.style,
          ]}
          className={selectedOption.className}
        >
          <Text
            style={[
              styles[`text_${selectedOption.type ?? "default"}`],
              selectedOption.textStyle,
            ]}
            className={selectedOption.textClassName}
          >
            {selectedOption.label}
          </Text>
        </View>
      );
    },
    [options, value],
  );

  if (options && options.length > 0 && value) {
    return _renderOption(options, value);
  }

  return (
    <View
      style={[
        styles.container,
        styles[type ?? "default"],
        containerStyle,
        style,
      ]}
      className={className}
    >
      <Text
        style={[styles[`text_${type ?? "default"}`], styles.text]}
        className={textClassName}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 80,
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
  text_success: {
    color: tokens.colors.success,
  },
  text_warning: {
    color: tokens.palette.amber[500],
  },
  text_error: {
    color: tokens.colors.error,
  },
  text_info: {
    color: tokens.colors.info,
  },
  text_default: {
    color: tokens.colors.success,
  },
  success: {
    backgroundColor: tokens.colors.successSurface,
  },
  warning: {
    backgroundColor: tokens.colors.warningSurface,
  },
  error: {
    backgroundColor: tokens.colors.errorSurface,
  },
  info: {
    backgroundColor: tokens.colors.infoSurface,
  },
  default: {
    backgroundColor: tokens.colors.surfaceMuted,
  },
});

export default Status;
