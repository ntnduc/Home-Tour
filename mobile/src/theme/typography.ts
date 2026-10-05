import { fontSize, fontWeight, lineHeight } from "./tokens";

/**
 * TYPOGRAPHY TOKENS — thang chữ dùng chung.
 * fontSize/lineHeight/fontWeight lấy từ `./tokens` để đồng bộ tailwind.config.js.
 */
export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
  },

  fontSize,
  lineHeight,
  fontWeight,

  // Text styles dựng sẵn
  text: {
    h1: { fontSize: fontSize.xxxl, lineHeight: lineHeight.xxxl, fontWeight: fontWeight.bold },
    h2: { fontSize: fontSize.xxl, lineHeight: lineHeight.xxl, fontWeight: fontWeight.bold },
    h3: { fontSize: fontSize.xl, lineHeight: lineHeight.xl, fontWeight: fontWeight.bold },
    body1: { fontSize: fontSize.md, lineHeight: lineHeight.md, fontWeight: fontWeight.regular },
    body2: { fontSize: fontSize.sm, lineHeight: lineHeight.sm, fontWeight: fontWeight.regular },
    caption: { fontSize: fontSize.xs, lineHeight: lineHeight.xs, fontWeight: fontWeight.regular },
  },
} as const;

export type TypographyType = typeof typography;
