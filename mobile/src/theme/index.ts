/**
 * DESIGN TOKENS — nguồn chân lý cho giao diện mobile.
 *
 * Kiến trúc 2 lớp:
 *   primitives (giá trị thô)  ->  semantic (ngữ nghĩa)  ->  UI
 *
 * CÁCH DÙNG (ưu tiên theo thứ tự):
 *   1. Dùng class Tailwind/NativeWind semantic trong `className`:
 *        bg-primary, text-foreground, text-muted, bg-success-surface,
 *        text-success, border-border, rounded-lg ...
 *      (đã bắc cầu trong `tailwind.config.js`).
 *   2. Khi buộc phải truyền MÀU vào prop của thư viện (icon color, chart,
 *      react-native-progress-steps...), import token trực tiếp:
 *        import { tokens } from '@/theme';
 *        tokens.colors.primary
 *
 * KHÔNG hardcode mã hex trong component nữa — thêm/sửa màu ở lớp primitives/semantic.
 *
 * Dark mode: hiện chỉ hỗ trợ light. Tên semantic được đặt cố định nên khi thêm
 * dark mode sau này chỉ cần bổ sung bảng semantic tối, KHÔNG phải sửa UI.
 */
import { colors, ColorType } from "./colors";
import { palette } from "./primitives";
import { radius } from "./radius";
import { semanticColors } from "./semantic";
import { shadows } from "./shadows";
import { spacing, SpacingType } from "./spacing";
import { typography, TypographyType } from "./typography";

/** Hệ token mới (khuyến nghị dùng). `colors` ở đây là semantic (phẳng). */
export const tokens = {
  palette,
  colors: semanticColors,
  spacing,
  typography,
  radius,
  shadows,
} as const;

export type Tokens = typeof tokens;

/**
 * @deprecated Cấu trúc theme cũ (colors lồng nhau). Giữ để tương thích ngược
 * trong lúc migrate dần. Code mới hãy dùng `tokens` hoặc class Tailwind semantic.
 */
export const theme = {
  colors,
  spacing,
  typography,
  radius,
} as const;

export type Theme = typeof theme;

export { palette } from "./primitives";
export { semanticColors } from "./semantic";
export { radius } from "./radius";
export { colors } from "./colors";
export { statusColor } from "./status";
export { shadows } from "./shadows";

// Re-export types
export type { Palette } from "./primitives";
export type { SemanticColors } from "./semantic";
export type { Radius } from "./radius";
export type { ColorType, SpacingType, TypographyType };
