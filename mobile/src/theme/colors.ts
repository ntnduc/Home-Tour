import { palette } from "./primitives";
import { semanticColors } from "./semantic";

/**
 * @deprecated Bảng màu CŨ (cấu trúc lồng nhau). Được giữ lại làm ALIAS tương
 * thích ngược cho các file đang import `{ colors }` trong lúc migrate dần.
 *
 * Giá trị được DERIVE từ `./primitives` + `./semantic` để chỉ còn MỘT nguồn
 * chân lý. Code mới KHÔNG dùng file này — hãy dùng class Tailwind semantic
 * (vd `bg-primary`, `text-muted`) hoặc `tokens` từ `@/theme`.
 */
export const colors = {
  primary: {
    main: palette.brand[500],
    light: palette.brand[50],
    dark: palette.brand[700],
  },

  secondary: {
    main: palette.red[500],
    light: palette.red[50],
    dark: palette.red[600],
  },

  neutral: {
    white: palette.white,
    black: palette.black,
    gray: {
      100: palette.gray[50],
      200: palette.gray[100],
      300: palette.gray[200],
      400: palette.gray[300],
      500: palette.gray[500],
      600: palette.gray[600],
      700: palette.gray[700],
      800: palette.gray[800],
      900: palette.gray[900],
    },
  },

  text: {
    primary: semanticColors.foreground,
    secondary: semanticColors.muted,
    disabled: semanticColors.subtle,
    inverse: semanticColors.onInverse,
  },

  background: {
    default: semanticColors.surface,
    paper: semanticColors.surfaceMuted,
    dark: palette.gray[900],
  },

  status: {
    draft: semanticColors.draft,
    success: semanticColors.success,
    warning: semanticColors.warning,
    error: palette.red[700],
    info: palette.blue[700],
  },

  border: {
    light: semanticColors.border,
    main: semanticColors.borderStrong,
    dark: palette.gray[500],
  },
} as const;

export type ColorType = typeof colors;
