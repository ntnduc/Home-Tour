/**
 * Shadow tier definitions for the Modern Minimalist design system.
 *
 * Three depth levels: soft (cards), medium (raised cards), hero (dominant KPI).
 * All values include Android `elevation` for consistent shadows across platforms.
 *
 * Import as:
 *   import { shadows } from "@/theme";
 */

import { StyleSheet, ViewStyle } from "react-native";
import { palette } from "./primitives";

export type ShadowTier = "soft" | "medium" | "hero";

export const shadows = StyleSheet.create<Record<ShadowTier, ViewStyle>>({
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
