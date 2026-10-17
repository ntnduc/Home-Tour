import { tokens, uiColors, uiType, uiWeight } from '@/theme';
import { isAndroidSystem } from '@/utils/appUtil';
import { formatDate, getCurrentDate } from '@/utils/dateUtil';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FieldError, FieldLabel, fieldColors, fieldStyles } from './FormField';
import { useGlobalAppSheet } from './GlobalAppSheet';
import PressableScale from './PressableScale';

export interface DatePickerIconProps {
  name?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

interface DatePickerProps {
  label?: string;
  value?: Date | null | undefined | string;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  inputStyles?: StyleProp<ViewStyle>;
  icon?: keyof typeof Ionicons.glyphMap;
  iconProps?: DatePickerIconProps;
  onClear?: () => void;
  showClear?: boolean;
  maxDate?: Date;
  minDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Chọn ngày',
  error,
  required = false,
  disabled = false,
  inputStyles,
  icon = 'calendar',
  iconProps,
  onClear,
  showClear = true,
  maxDate,
  minDate,
}) => {
  const { openAppSheet, closeAppSheet } = useGlobalAppSheet();
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<typeof value>(value);
  // Ref để lưu giá trị hiện tại trong picker, tránh closure issue
  const pickerValueRef = useRef<typeof value>(value);

  // Sync currentValue với value prop khi value thay đổi từ bên ngoài
  useEffect(() => {
    setCurrentValue(value);
    pickerValueRef.current = value;
  }, [value]);

  const handleOpen = () => {
    if (disabled) return;

    // Reset currentValue về value hiện tại mỗi khi mở picker
    // Nếu value là null, dùng ngày hiện tại làm giá trị mặc định
    const initialValue = value || (required ? getCurrentDate() : null);
    setCurrentValue(initialValue);
    pickerValueRef.current = initialValue;

    if (isAndroidSystem()) {
      setIsOpen(true);
      return;
    }

    openAppSheet(
      <BottomSheetView
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <DateTimePicker
          style={{
            width: '100%',
            height: '100%',
          }}
          value={initialValue ? new Date(initialValue) : new Date()}
          mode="date"
          locale="vi-VN"
          display="spinner"
          maximumDate={maxDate}
          minimumDate={minDate}
          onChange={(event, date) => {
            if (date) {
              setCurrentValue(date);
              pickerValueRef.current = date;
            }
          }}
        />
      </BottomSheetView>,
      {
        // snapPoints: [300],
        snapPoints: ['35%'],
        header: {
          element: (
            <View style={styles.sheetHeader}>
              <PressableScale onPress={closeAppSheet} hitSlop={8} style={styles.sheetAction}>
                <Text style={styles.sheetCancel}>Hủy</Text>
              </PressableScale>
              <Text style={uiType.section}>Chọn ngày</Text>
              <PressableScale
                onPress={() => {
                  // Sử dụng ref để tránh closure issue, đảm bảo lấy giá trị mới nhất
                  const selectedValue = pickerValueRef.current;
                  if (selectedValue) {
                    onChange?.(new Date(selectedValue));
                  }
                  closeAppSheet();
                }}
                scaleTo={0.94}
                style={styles.sheetDone}
              >
                <Text style={styles.sheetDoneText}>Xong</Text>
              </PressableScale>
            </View>
          ),
        },
        enableOverDrag: false,
        enableHandlePanningGesture: false,
        enableContentPanningGesture: false,
        enablePanDownToClose: false,
      },
    );
  };

  const handleClear = () => {
    onChange?.(null);
    onClear?.();
  };

  const _renderDateTimePickerAndroid = useCallback(() => {
    if (!isOpen) return null;
    return (
      <DateTimePicker
        style={{
          width: '100%',
          height: '100%',
        }}
        value={value ? new Date(value) : new Date()}
        mode="date"
        locale="vi-VN"
        maximumDate={maxDate}
        minimumDate={minDate}
        positiveButton={{ label: 'Xác nhận', textColor: tokens.colors.primary }}
        negativeButton={{ label: 'Hủy', textColor: uiColors.textMuted }}
        onChange={(event, date) => {
          if (event.type === 'dismissed') {
            setIsOpen(false);
          }
          if (event.type === 'set') {
            if (date) {
              onChange?.(date);
            }
            setIsOpen(false);
          }
        }}
      />
    );
  }, [value, isOpen]);

  return (
    <View>
      {label && <FieldLabel label={label} required={required} />}
      <View
        style={[
          fieldStyles.box,
          !!error && fieldStyles.boxError,
          disabled && fieldStyles.boxDisabled,
          inputStyles,
        ]}
      >
        <PressableScale
          style={styles.trigger}
          onPress={handleOpen}
          disabled={disabled}
          scaleTo={0.99}
          accessibilityRole="button"
          accessibilityLabel={label ?? placeholder}
        >
          {icon && (
            <Ionicons
              name={iconProps?.name ?? icon}
              size={iconProps?.size ?? 18}
              color={iconProps?.color ?? fieldColors.icon}
            />
          )}
          <Text
            style={[fieldStyles.text, !value && styles.placeholder]}
            numberOfLines={1}
          >
            {value ? formatDate(value?.toString() ?? '') : placeholder}
          </Text>
        </PressableScale>
        {!!value && showClear && !disabled && !required && (
          <Ionicons
            name="close-circle"
            size={18}
            color={fieldColors.icon}
            accessibilityLabel="Xoá ngày"
            suppressHighlighting
            onPress={handleClear}
          />
        )}
      </View>
      <FieldError message={error} />
      {isAndroidSystem() && _renderDateTimePickerAndroid()}
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  placeholder: {
    color: fieldColors.placeholder,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.hairline,
  },
  sheetAction: {
    paddingVertical: 8,
  },
  sheetCancel: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: uiWeight.medium,
    color: uiColors.textMuted,
  },
  sheetDone: {
    paddingHorizontal: 16,
    height: 36,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: tokens.colors.primary,
  },
  sheetDoneText: {
    color: tokens.colors.onPrimary,
    fontWeight: uiWeight.semibold,
  },
});

export default DatePicker;
