import { FieldError, FieldLabel } from '@/components/FormField';
import { tokens, uiColors, uiType } from '@/theme';
import React from 'react';
import { Switch as RNSwitch, StyleSheet, Text, View } from 'react-native';
import { SwitchProps } from './types';

const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  description,
  error,
  required = false,
  disabled = false,
  size = 'medium',
  activeColor,
  inactiveColor,
  thumbColor,
  containerStyle,
  labelStyle,
  alignLabel = 'vertical',
  descriptionStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) => {
  // Tính toán size cho switch
  const getSwitchSize = () => {
    switch (size) {
      case 'small':
        return { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] };
      case 'large':
        return { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] };
      default:
        return {};
    }
  };

  // Tính toán màu sắc
  const getActiveColor = () => {
    if (activeColor) return activeColor;
    if (error) return tokens.colors.error;
    return tokens.colors.primary;
  };

  const getInactiveColor = () => {
    if (inactiveColor) return inactiveColor;
    return uiColors.fieldBorder;
  };

  const getThumbColor = () => {
    if (thumbColor) return thumbColor;
    return tokens.colors.surface;
  };

  const isHorizontal = alignLabel === 'horizontal';

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <View style={isHorizontal ? styles.rowHorizontal : styles.rowVertical}>
        <View style={isHorizontal ? styles.textColHorizontal : undefined}>
          {label && (
            <FieldLabel
              label={label}
              required={required}
              style={[isHorizontal && styles.labelInline, labelStyle]}
            />
          )}
          {description && (
            <Text style={[uiType.caption, styles.description, descriptionStyle]}>
              {description}
            </Text>
          )}
        </View>

        <RNSwitch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: getInactiveColor(),
            true: getActiveColor(),
          }}
          thumbColor={getThumbColor()}
          ios_backgroundColor={getInactiveColor()}
          style={getSwitchSize()}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityRole="switch"
          accessibilityState={{
            checked: value,
            disabled: disabled,
          }}
        />
      </View>
      <FieldError message={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  rowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowVertical: {
    alignItems: 'flex-start',
  },
  textColHorizontal: {
    flex: 1,
  },
  labelInline: {
    marginBottom: 0,
  },
  description: {
    marginTop: 2,
    marginBottom: 8,
  },
});

export default Switch;
