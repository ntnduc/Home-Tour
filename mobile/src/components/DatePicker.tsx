import { createStyles } from '@/styles/component/StyleInput';
import { useTheme } from '@/theme/ThemeProvider';
import { isAndroidSystem } from '@/utils/appUtil';
import { formatDate, getCurrentDate } from '@/utils/dateUtil';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useGlobalAppSheet } from './GlobalAppSheet';

export interface DatePickerIconProps {
  name?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  className?: string;
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
  const theme = useTheme();
  const { openAppSheet, closeAppSheet } = useGlobalAppSheet();
  const styles = createStyles(theme);
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
            <View className="flex-row justify-between items-center border-b border-gray-200 w-full p-4 rounded-t-2xl h-[60px]">
              <TouchableOpacity onPress={closeAppSheet} className="py-2">
                <Text className="text-gray-600 font-medium">Hủy</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-900">
                Chọn ngày
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Sử dụng ref để tránh closure issue, đảm bảo lấy giá trị mới nhất
                  const selectedValue = pickerValueRef.current;
                  if (selectedValue) {
                    onChange?.(selectedValue as any);
                  }
                  closeAppSheet();
                }}
                className="px-4 py-2 bg-primary rounded-lg"
              >
                <Text className="text-white font-semibold">Xong</Text>
              </TouchableOpacity>
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
        positiveButton={{ label: 'Xác nhận', textColor: 'green' }}
        negativeButton={{ label: 'Hủy', textColor: 'red' }}
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
    <View className="">
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.requiredText}> *</Text>}
        </Text>
      )}
      <View
        className={`flex flex-row items-center content-center justify-center rounded-lg px-3 py-2 border  ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200'
        } ${disabled ? 'bg-gray-100' : ''}`}
        style={inputStyles}
      >
        <TouchableOpacity
          className="flex-1"
          onPress={handleOpen}
          disabled={disabled}
        >
          <View className="flex-row items-center ">
            {icon && (
              <Ionicons
                name={icon}
                size={18}
                color={'#6B7280'}
                className="mr-3"
                {...iconProps}
              />
            )}
            <Text
              className={` text-base mt-1 ${
                value ? 'text-gray-900' : 'text-gray-500'
              }`}
              style={[
                styles.input,
                inputStyles,
                { borderColor: error ? '#ff3b30' : '#ddd' },
              ]}
            >
              {value ? formatDate(value?.toString() ?? '') : placeholder}
            </Text>
          </View>
        </TouchableOpacity>
        {value && showClear && !disabled && !required && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons
              name="close-outline"
              size={18}
              color={'#6B7280'}
              className="mr-3"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="mt-1" style={styles.errorText}>
          {error}
        </Text>
      )}
      {isAndroidSystem() && _renderDateTimePickerAndroid()}
    </View>
  );
};

export default DatePicker;
