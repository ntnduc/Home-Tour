/**
 * DESIGN LAYER — Property module (Modern Minimalist).
 *
 * Thin aliases of the shared UI scale in `@/theme/ui.ts` (the single source of
 * truth). Kept so existing property components keep their import names.
 */

import { uiColors, uiRadius, uiSpace, uiType, uiWeight } from "@/theme";

export const PROP_RADIUS = uiRadius;
export const PROP_SPACE = uiSpace;
export const propColors = uiColors;
export const propWeight = uiWeight;
export const propType = uiType;
