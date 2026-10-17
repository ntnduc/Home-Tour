import { StyleSheet, TextStyle } from "react-native";
import { palette } from "./primitives";
import { semanticColors as colors } from "./semantic";
import { typography } from "./typography";

/**
 * UI SCALE — "Modern Minimalist" design language shared by every screen.
 *
 * Extracted from the Dashboard (`homeStyles.ts`) and Property list
 * (`propertyListStyles.ts`) reference screens; those files now alias this one.
 * Shared components in `src/components/` read from here so screens never
 * repeat raw radius / spacing / type values.
 *
 * Import as: `import { uiRadius, uiSpace, uiColors, uiType, uiWeight } from "@/theme";`
 */

type FontWeight = TextStyle["fontWeight"];

/** `tokens.js` types fontWeight as plain string → cast once for RN StyleSheet. */
export const uiWeight = {
  regular: typography.fontWeight.regular as FontWeight,
  medium: typography.fontWeight.medium as FontWeight,
  semibold: "600" as FontWeight,
  bold: typography.fontWeight.bold as FontWeight,
} as const;

/** Radius scale — cards always ≥ 20. */
export const uiRadius = {
  hero: 28,
  card: 24,
  tile: 20,
  icon: 16,
  iconSm: 12,
  field: 14,
  pill: 999,
} as const;

/** Spacing scale — gutter, grid gap, section break, card padding. */
export const uiSpace = {
  screen: 20,
  gap: 12,
  section: 28,
  card: 16,
  hero: 22,
} as const;

/** Color roles — mapped from semantic tokens (no hex here). */
export const uiColors = {
  canvas: colors.surfaceMuted,
  card: colors.surface,
  ink: palette.gray[900],
  text: colors.foreground,
  textMuted: colors.muted,
  textSubtle: colors.subtle,
  hairline: colors.border,
  fieldBorder: palette.gray[200],
  fieldDisabled: palette.gray[100],
  skeleton: palette.gray[200],
  track: palette.gray[200],
} as const;

/** Type scale: display → title → section → body → caption → eyebrow. */
export const uiType = StyleSheet.create({
  display: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: uiWeight.bold,
    letterSpacing: -0.8,
    color: uiColors.ink,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontWeight: uiWeight.bold,
    letterSpacing: -0.5,
    color: uiColors.ink,
  },
  section: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: uiWeight.bold,
    letterSpacing: -0.3,
    color: uiColors.ink,
  },
  body: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: uiColors.text,
  },
  bodyStrong: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: uiWeight.semibold,
    color: uiColors.ink,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: uiColors.textMuted,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: uiWeight.bold,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: uiColors.textSubtle,
  },
});
