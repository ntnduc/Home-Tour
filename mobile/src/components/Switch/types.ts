import { StyleProp, TextStyle, ViewStyle } from "react-native";

export interface SwitchProps {
  /** Giá trị hiện tại của switch */
  value: boolean;
  /** Callback khi giá trị thay đổi */
  onValueChange: (value: boolean) => void;
  /** Label hiển thị bên cạnh switch */
  label?: string;
  /** Text mô tả ngắn gọn */
  description?: string;
  /** Text lỗi hiển thị dưới switch */
  error?: string;
  /** Switch có bắt buộc hay không */
  required?: boolean;
  /** Switch có bị disable hay không */
  disabled?: boolean;
  /** Size của switch */
  size?: "small" | "medium" | "large";
  /** Màu sắc của switch khi active */
  activeColor?: string;
  /** Màu sắc của switch khi inactive */
  inactiveColor?: string;
  /** Màu sắc của thumb */
  thumbColor?: string;
  /** Style cho container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style cho label */
  labelStyle?: StyleProp<TextStyle>;
  /** Align label */
  alignLabel?: "vertical" | "horizontal";
  /** Style cho description */
  descriptionStyle?: StyleProp<TextStyle>;
  /** Test ID cho testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
}
