export const colors = {
  // Primary colors
  primary: {
    main: "#6a5af9",
    light: "#eef1fd",
    dark: "#4a3fd9",
  },

  // Secondary colors
  secondary: {
    main: "#ff4d4d",
    light: "#ffe5e5",
    dark: "#e63d3d",
  },

  // Neutral colors
  neutral: {
    white: "#ffffff",
    black: "#000000",
    gray: {
      100: "#f8f9fa",
      200: "#f0f0f0",
      300: "#e9ecef",
      400: "#dee2e6",
      500: "#adb5bd",
      600: "#6c757d",
      700: "#495057",
      800: "#343a40",
      900: "#212529",
    },
  },

  // Text colors
  text: {
    primary: "#333333",
    secondary: "#666666",
    disabled: "#999999",
    inverse: "#ffffff",
  },

  // Background colors
  background: {
    default: "#ffffff",
    paper: "#f8f9fa",
    dark: "#212529",
  },

  // Status colors
  status: {
    draft: "#6B7280",
    success: "#28a745",
    warning: "#ffc107",
    error: "#dc3545",
    info: "#17a2b8",
  },

  // Border colors
  border: {
    light: "#f0f0f0",
    main: "#dee2e6",
    dark: "#adb5bd",
  },
} as const;

export type ColorType = typeof colors;
