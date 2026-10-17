import { tokens, uiColors } from "@/theme";

/**
 * Bảng màu cho phần hiển thị tiến trình (icon tròn, đường nối, label) của
 * `react-native-progress-steps`.
 *
 * Quy ước:
 * - Bước đã hoàn thành  -> xanh lá (success)
 * - Bước đang thực hiện -> màu thương hiệu (primary)
 * - Bước chưa tới       -> xám nhạt (disabled)
 */
export const stepProgressColors = {
  // --- Bước đang thực hiện (active) ---
  activeStepIconColor: tokens.colors.primary,
  activeStepIconBorderColor: tokens.colors.primary,
  activeStepNumColor: tokens.colors.onPrimary,
  activeLabelColor: tokens.colors.primary,

  // --- Bước đã hoàn thành (completed) ---
  completedStepIconColor: tokens.colors.success,
  completedStepNumColor: tokens.colors.onPrimary,
  completedCheckColor: tokens.colors.onPrimary,
  completedProgressBarColor: tokens.colors.success,
  completedLabelColor: tokens.colors.success,

  // --- Bước chưa tới (disabled / upcoming) ---
  disabledStepIconColor: tokens.palette.gray[300],
  disabledStepNumColor: tokens.palette.gray[600],
  progressBarColor: tokens.palette.gray[300],
  labelColor: uiColors.textMuted,
} as const;

/** Variant name accepted by step actions (rendered through `Button`). */
export type StepButtonVariant = "primary" | "secondary" | "success" | "danger" | "outline";
