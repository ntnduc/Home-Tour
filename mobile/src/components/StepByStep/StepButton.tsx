import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { StepButtonVariant, stepButtonVariants } from './colors';

export interface StepButtonProps {
  label: string;
  onPress: () => void;
  variant?: StepButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  /** Class Tailwind bổ sung để tuỳ biến. */
  className?: string;
}

/**
 * Nút hành động tái sử dụng cho từng bước.
 *
 * - Style theo các preset variant (primary / secondary / success / danger / outline).
 * - Hỗ trợ icon 2 phía và trạng thái loading (spinner) cho các thao tác async.
 */
export const StepButton: React.FC<StepButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  isLoading = false,
  loadingText = 'Đang xử lý...',
  disabled = false,
  className,
}) => {
  const variantStyle = stepButtonVariants[variant];
  const isDisabled = disabled || isLoading;

  const iconNode = icon ? (
    <Ionicons name={icon} size={18} color={variantStyle.contentColor} />
  ) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={onPress}
      className={clsx(
        'h-12 flex-row items-center justify-center gap-2 rounded-xl px-5 shadow-sm',
        variantStyle.container,
        isDisabled && 'opacity-60',
        className,
      )}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variantStyle.contentColor} />
      ) : (
        iconPosition === 'left' && iconNode
      )}

      <Text className={clsx('text-base font-semibold', variantStyle.text)}>
        {isLoading ? loadingText : label}
      </Text>

      {!isLoading && iconPosition === 'right' && iconNode}
    </TouchableOpacity>
  );
};
