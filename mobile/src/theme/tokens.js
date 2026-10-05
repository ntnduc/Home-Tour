/**
 * RAW DESIGN TOKENS — nguồn chân lý DUY NHẤT (CommonJS).
 *
 * Vì sao là `.js` (CommonJS)? `tailwind.config.js` chạy bằng Node nên không thể
 * `require` file `.ts`. Đặt giá trị thô ở đây để CẢ HAI phía cùng dùng một nguồn:
 *   - Tailwind/NativeWind:  require('./src/theme/tokens') trong tailwind.config.js
 *   - App (TypeScript):     các file primitives.ts / semantic.ts / ... re-export lại
 *
 * KHÔNG import trực tiếp file này trong component — hãy dùng class Tailwind
 * semantic (bg-primary, text-muted...) hoặc `tokens` từ `@/theme`.
 */

// --- Lớp 1: palette thô (chỉ giá trị, không ngữ nghĩa) ---
const palette = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  brand: {
    50: '#eef1fd',
    100: '#e0e4fb',
    200: '#c7cdf8',
    300: '#a9b0f4',
    400: '#8a7af9',
    500: '#6a5af9',
    600: '#5a4af0',
    700: '#4a3fd9',
    800: '#3a32ab',
    900: '#2b2580',
  },
  gray: {
    50: '#f8f9fa',
    100: '#f0f0f0',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
  red: {
    50: '#ffe5e5',
    100: '#ffecec',
    200: '#ffc9c9',
    300: '#ff9c9c',
    400: '#ff6b6b',
    500: '#ff4d4d',
    600: '#e63d3d',
    700: '#dc3545',
    800: '#b02a37',
    900: '#7a1d26',
  },
  green: {
    50: '#e9f9ef',
    100: '#d3f3df',
    200: '#a7e7bf',
    300: '#6fd99a',
    400: '#34c759',
    500: '#28a745',
    600: '#218838',
    700: '#1c7430',
    800: '#155724',
    900: '#0d3d19',
  },
  amber: {
    50: '#fff6e5',
    100: '#ffecc2',
    200: '#ffdd8a',
    300: '#ffcc4d',
    400: '#ffc107',
    500: '#ff9500',
    600: '#e08600',
    700: '#b36b00',
    800: '#8a5200',
    900: '#5c3700',
  },
  blue: {
    50: '#e3f2fd',
    100: '#d0e7fb',
    200: '#a6d2f7',
    300: '#6fb6ef',
    400: '#3498db',
    500: '#1976d2',
    600: '#1565c0',
    700: '#17a2b8',
    800: '#0f6674',
    900: '#0a434c',
  },
};

// --- Lớp 2: semantic (ngữ nghĩa) ---
const semantic = {
  primary: palette.brand[500],
  primaryMuted: palette.brand[50],
  primaryStrong: palette.brand[700],
  onPrimary: palette.white,

  secondary: palette.red[500],
  secondaryMuted: palette.red[50],
  secondaryStrong: palette.red[700],
  onSecondary: palette.white,

  surface: palette.white,
  surfaceMuted: palette.gray[50],
  surfaceStrong: palette.gray[900],
  onSurface: palette.gray[800],
  onSurfaceStrong: palette.white,
  overlay: 'rgba(0, 0, 0, 0.5)',

  foreground: '#333333',
  muted: '#666666',
  subtle: '#999999',
  onInverse: palette.white,

  border: palette.gray[100],
  borderStrong: palette.gray[300],

  success: palette.green[500],
  successSurface: palette.green[50],
  warning: palette.amber[400],
  warningSurface: palette.amber[50],
  error: palette.red[700],
  errorSurface: palette.red[100],
  info: palette.blue[500],
  infoSurface: palette.blue[50],
  draft: palette.gray[600],
  draftSurface: palette.gray[100],
};

// --- Thang số dùng chung ---
const spacingScale = {
  0: 0,
  px: 1,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 40,
};

const fontWeight = {
  regular: '400',
  medium: '500',
  bold: '700',
};

const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

module.exports = {
  palette,
  semantic,
  spacingScale,
  fontSize,
  lineHeight,
  fontWeight,
  radius,
};
