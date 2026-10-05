/** @type {import('tailwindcss').Config} */
const {
  palette,
  semantic,
  spacingScale,
  fontSize,
  lineHeight,
  radius,
} = require("./src/theme/tokens")

module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // Chuẩn bị sẵn cho dark mode (hiện CHƯA bật — app chạy light mode).
  darkMode: "class",
  theme: {
    extend: {
      // Semantic colors -> class: bg-primary, text-muted, border-border, bg-success-surface...
      colors: {
        primary: {
          DEFAULT: semantic.primary,
          muted: semantic.primaryMuted,
          strong: semantic.primaryStrong,
          foreground: semantic.onPrimary,
        },
        secondary: {
          DEFAULT: semantic.secondary,
          muted: semantic.secondaryMuted,
          strong: semantic.secondaryStrong,
          foreground: semantic.onSecondary,
        },
        surface: {
          DEFAULT: semantic.surface,
          muted: semantic.surfaceMuted,
          strong: semantic.surfaceStrong,
          foreground: semantic.onSurface,
        },
        foreground: {
          DEFAULT: semantic.foreground,
          muted: semantic.muted,
          subtle: semantic.subtle,
        },
        border: {
          DEFAULT: semantic.border,
          strong: semantic.borderStrong,
        },
        success: { DEFAULT: semantic.success, surface: semantic.successSurface },
        warning: { DEFAULT: semantic.warning, surface: semantic.warningSurface },
        error: { DEFAULT: semantic.error, surface: semantic.errorSurface },
        info: { DEFAULT: semantic.info, surface: semantic.infoSurface },
        draft: { DEFAULT: semantic.draft, surface: semantic.draftSurface },
        // Palette thô cho trường hợp đặc biệt (hạn chế dùng): bg-brand-500...
        brand: palette.brand,
      },
      // fontSize semantic: text-xs..text-xxxl (kèm lineHeight)
      fontSize: {
        xs: [`${fontSize.xs}px`, `${lineHeight.xs}px`],
        sm: [`${fontSize.sm}px`, `${lineHeight.sm}px`],
        md: [`${fontSize.md}px`, `${lineHeight.md}px`],
        lg: [`${fontSize.lg}px`, `${lineHeight.lg}px`],
        xl: [`${fontSize.xl}px`, `${lineHeight.xl}px`],
        xxl: [`${fontSize.xxl}px`, `${lineHeight.xxl}px`],
        xxxl: [`${fontSize.xxxl}px`, `${lineHeight.xxxl}px`],
      },
      // spacing semantic: p-xs, gap-md, m-lg... (vẫn giữ thang số mặc định của tailwind)
      spacing: {
        xs: `${spacingScale.xs}px`,
        sm: `${spacingScale.sm}px`,
        md: `${spacingScale.md}px`,
        lg: `${spacingScale.lg}px`,
        xl: `${spacingScale.xl}px`,
        xxl: `${spacingScale.xxl}px`,
      },
      // borderRadius semantic: rounded-sm..rounded-xxl, rounded-full
      borderRadius: {
        none: `${radius.none}px`,
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        xl: `${radius.xl}px`,
        xxl: `${radius.xxl}px`,
        full: `${radius.full}px`,
      },
    },
  },
  plugins: [],
}
