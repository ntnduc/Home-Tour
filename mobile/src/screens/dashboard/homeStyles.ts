import { shadows, tokens, uiColors, uiRadius, uiSpace, uiType, uiWeight } from "@/theme";

/**
 * DESIGN LAYER CỦA TRANG CHỦ (Modern Minimalist).
 *
 * Thang bo góc / khoảng cách / chữ / màu dùng chung nằm ở `@/theme/ui.ts`;
 * file này chỉ alias lại và bổ sung các màu riêng của hero doanh thu.
 */
const { palette, colors } = tokens;

export const homeWeight = uiWeight;
export const HOME_RADIUS = uiRadius;
export const HOME_SPACE = uiSpace;

/** Bảng màu trang chủ — màu chung + màu riêng của hero. */
export const homeColors = {
  ...uiColors,
  heroBg: colors.primaryStrong,
  heroAccent: colors.primary,
  onHero: colors.onPrimary,
  onHeroMuted: "rgba(255, 255, 255, 0.72)",
  heroGlass: "rgba(255, 255, 255, 0.12)",
  heroGlassStrong: "rgba(255, 255, 255, 0.18)",
  ringTrack: "rgba(255, 255, 255, 0.16)",
  ringFrom: palette.green[300],
  ringTo: palette.green[400],
} as const;

/** Alias of theme/shadows.ts — kept for backward compatibility. */
export const homeShadow = shadows;

export const homeType = uiType;
