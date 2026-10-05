import { spacingScale } from "./tokens";

/**
 * SPACING TOKENS — thang khoảng cách dùng chung.
 * Thang cơ bản (xs..xxl) lấy từ `./tokens` để đồng bộ với tailwind.config.js.
 */
export const spacing = {
  base: 4,

  xs: spacingScale.xs, // 4px
  sm: spacingScale.sm, // 8px
  md: spacingScale.md, // 16px
  lg: spacingScale.lg, // 24px
  xl: spacingScale.xl, // 32px
  xxl: spacingScale.xxl, // 48px

  screen: {
    padding: spacingScale.md,
    margin: spacingScale.md,
  },

  component: {
    padding: spacingScale.md,
    margin: spacingScale.sm,
    gap: spacingScale.sm,
  },

  layout: {
    header: 56,
    footer: 56,
    sidebar: 240,
  },
} as const;

export type SpacingType = typeof spacing;
