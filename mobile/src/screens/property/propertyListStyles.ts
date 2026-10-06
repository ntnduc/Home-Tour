/**
 * DESIGN LAYER — Property List screen (Modern Minimalist).
 *
 * Centralized radius, spacing, colors, type scale, and weights for the property
 * list feature. Imported by components within PropertyList + PropertyCard.
 */

import { tokens } from "@/theme";
import { StyleSheet, TextStyle } from "react-native";

type FontWeight = TextStyle["fontWeight"];

/** Radius scale for property cards and elements. */
export const PROP_RADIUS = {
  card: 24,
  tile: 20,
  icon: 16,
  pill: 999,
} as const;

/** Spacing scale — gutter, gaps, and section breaks. */
export const PROP_SPACE = {
  screen: 20,
  gap: 12,
  section: 28,
} as const;

/** Color palette — mapped from semantic tokens. */
export const propColors = {
  canvas: tokens.colors.surfaceMuted,
  card: tokens.colors.surface,
  text: tokens.colors.foreground,
  textMuted: tokens.colors.muted,
  textSubtle: tokens.colors.subtle,
  hairline: tokens.colors.border,
  ink: tokens.palette.gray[900],
} as const;

/** Font weights — cast from tokens for use in RN StyleSheet. */
export const propWeight = {
  regular: tokens.typography.fontWeight.regular as FontWeight,
  medium: tokens.typography.fontWeight.medium as FontWeight,
  semibold: "600" as FontWeight,
  bold: tokens.typography.fontWeight.bold as FontWeight,
} as const;

/** Type scale — title, section, body, caption, eyebrow. */
export const propType = StyleSheet.create({
  title: {
    fontSize: tokens.typography.fontSize.xxl,
    lineHeight: tokens.typography.lineHeight.xxl,
    fontWeight: propWeight.bold,
    letterSpacing: -0.5,
    color: propColors.ink,
  },
  section: {
    fontSize: tokens.typography.fontSize.lg,
    lineHeight: tokens.typography.lineHeight.lg,
    fontWeight: propWeight.bold,
    letterSpacing: -0.3,
    color: propColors.ink,
  },
  body: {
    fontSize: tokens.typography.fontSize.sm,
    lineHeight: tokens.typography.lineHeight.sm,
    color: propColors.text,
  },
  caption: {
    fontSize: tokens.typography.fontSize.xs,
    lineHeight: tokens.typography.lineHeight.xs,
    color: propColors.textMuted,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: propWeight.bold,
    letterSpacing: 1.1,
    textTransform: "uppercase" as const,
  },
});
