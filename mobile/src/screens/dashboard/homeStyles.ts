import { tokens } from "@/theme";
import { StyleSheet, TextStyle } from "react-native";

/**
 * DESIGN LAYER CỦA TRANG CHỦ (Modern Minimalist).
 *
 * Mọi màu đều đi qua `tokens` (không hardcode hex). File này chỉ định nghĩa
 * "ngôn ngữ thị giác" riêng của trang chủ:
 *  - Bo góc lớn (20+) cho cảm giác mềm, cao cấp.
 *  - 3 tầng đổ bóng (soft → medium → hero) tạo chiều sâu xếp lớp:
 *      canvas xám nhạt  <  card trắng (soft)  <  card nổi (medium)  <  hero (bóng màu brand)
 */
const { palette, colors, typography } = tokens;

type FontWeight = TextStyle["fontWeight"];

/** `tokens.js` khai báo fontWeight là string thường → ép về kiểu RN để dùng trong StyleSheet. */
export const homeWeight = {
  regular: typography.fontWeight.regular as FontWeight,
  medium: typography.fontWeight.medium as FontWeight,
  semibold: "600" as FontWeight,
  bold: typography.fontWeight.bold as FontWeight,
} as const;

export const HOME_RADIUS = {
  hero: 28,
  card: 24,
  tile: 20,
  icon: 16,
  pill: 999,
} as const;

export const HOME_SPACE = {
  /** Lề ngang toàn màn hình */
  screen: 20,
  /** Khoảng cách giữa các card trong lưới */
  gap: 12,
  /** Khoảng cách giữa các section */
  section: 28,
} as const;

/** Bảng màu trang chủ — ánh xạ từ semantic token. */
export const homeColors = {
  canvas: colors.surfaceMuted,
  card: colors.surface,
  heroBg: colors.primaryStrong,
  heroAccent: colors.primary,
  onHero: colors.onPrimary,
  onHeroMuted: "rgba(255, 255, 255, 0.72)",
  heroGlass: "rgba(255, 255, 255, 0.12)",
  heroGlassStrong: "rgba(255, 255, 255, 0.18)",
  ringTrack: "rgba(255, 255, 255, 0.16)",
  ringFrom: palette.green[300],
  ringTo: palette.green[400],
  ink: palette.gray[900],
  text: colors.foreground,
  textMuted: colors.muted,
  textSubtle: colors.subtle,
  hairline: colors.border,
  skeleton: palette.gray[200],
} as const;

export const homeShadow = StyleSheet.create({
  soft: {
    shadowColor: palette.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  medium: {
    shadowColor: palette.gray[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  hero: {
    shadowColor: palette.brand[700],
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 12,
  },
});

/** Thang chữ: số liệu lớn (display) → tiêu đề → nhãn nhỏ viết hoa (eyebrow). */
export const homeType = StyleSheet.create({
  display: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: homeWeight.bold,
    letterSpacing: -0.8,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontWeight: homeWeight.bold,
    letterSpacing: -0.5,
  },
  section: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: homeWeight.bold,
    letterSpacing: -0.3,
    color: homeColors.ink,
  },
  body: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: homeColors.text,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: homeColors.textMuted,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: homeWeight.bold,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
});
