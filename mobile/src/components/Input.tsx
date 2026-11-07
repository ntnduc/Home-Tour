import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { FieldError, FieldLabel, fieldColors, fieldStyles } from "./FormField";

export interface InputIconProps {
  name?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

interface InputProps extends Omit<TextInputProps, "onChangeText" | "editable"> {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  type?: "text" | "number" | "area";
  formatMoney?: boolean;
  min?: number;
  max?: number;
  numberOfLines?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  /** Extra style for the TextInput itself. */
  inputStyles?: StyleProp<TextStyle>;
  /** Extra style for the field box. */
  containerStyle?: StyleProp<ViewStyle>;
  labelStyles?: StyleProp<TextStyle>;
  iconProps?: InputIconProps;
  onClear?: () => void;
  showClear?: boolean;
  /** Swap the native TextInput, e.g. BottomSheetTextInput inside a bottom sheet. */
  inputComponent?: React.ComponentType<TextInputProps>;
}

type FocusEvent = Parameters<NonNullable<TextInputProps["onFocus"]>>[0];

const formatThousands = (text: string) =>
  text.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/**
 * Text field — label, leading icon, clear button, error. Look defined in `FormField`.
 *
 * `type="number"` keeps digits only (respects min/max) · `formatMoney` groups
 * thousands with "." · `type="area"` is a 96pt multiline box.
 */
const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  type = "text",
  formatMoney = false,
  min,
  max,
  numberOfLines = 1,
  keyboardType = "default",
  icon,
  disabled = false,
  inputStyles,
  containerStyle,
  labelStyles,
  iconProps,
  onClear,
  showClear = true,
  inputComponent: InputComponent = TextInput,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const isArea = type === "area";

  const handleChangeText = (text: string) => {
    if (type === "number") {
      const numericValue = text.replace(/[^0-9]/g, "");
      const num = parseInt(numericValue, 10);
      if (min !== undefined && num < min) return;
      if (max !== undefined && num > max) return;
      onChangeText?.(numericValue);
    } else if (formatMoney) {
      onChangeText?.(formatThousands(text));
    } else {
      onChangeText?.(text);
    }
  };

  const handleFocus = (e: FocusEvent) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: FocusEvent) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View>
      {label && <FieldLabel label={label} required={required} style={labelStyles} />}
      <View
        style={[
          fieldStyles.box,
          isArea && styles.areaBox,
          focused && fieldStyles.boxFocused,
          !!error && fieldStyles.boxError,
          disabled && fieldStyles.boxDisabled,
          containerStyle,
        ]}
      >
        {icon && (
          <Ionicons
            name={iconProps?.name ?? icon}
            size={iconProps?.size ?? 18}
            color={iconProps?.color ?? fieldColors.icon}
            style={isArea && styles.areaIcon}
          />
        )}
        <InputComponent
          value={value}
          style={[fieldStyles.text, styles.input, isArea && styles.areaInput, inputStyles]}
          onChangeText={handleChangeText}
          placeholder={placeholder ?? (label ? `Nhập ${label.toLowerCase()}...` : undefined)}
          keyboardType={type === "number" ? "numeric" : keyboardType}
          placeholderTextColor={fieldColors.placeholder}
          multiline={isArea}
          numberOfLines={isArea ? numberOfLines : 1}
          textAlignVertical={isArea ? "top" : "center"}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {!!value && showClear && !disabled && !props.readOnly && (
          <Ionicons
            name="close-circle"
            size={18}
            color={fieldColors.icon}
            accessibilityLabel="Xoá nội dung"
            style={isArea && styles.areaClear}
            suppressHighlighting
            onPress={() => {
              onChangeText?.("");
              onClear?.();
            }}
          />
        )}
      </View>
      <FieldError message={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  areaBox: {
    alignItems: "flex-start",
  },
  areaIcon: {
    marginTop: 13,
  },
  // Center the clear button vertically in the multiline box
  areaClear: {
    alignSelf: "center",
  },
  areaInput: {
    minHeight: 96,
  },
});

export default Input;
