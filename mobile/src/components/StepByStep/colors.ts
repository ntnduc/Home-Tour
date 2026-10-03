import { colors } from "@/theme/colors";

/**
 * Bảng màu cho phần hiển thị tiến trình (icon tròn, đường nối, label) của
 * `react-native-progress-steps`.
 *
 * Quy ước:
 * - Bước đã hoàn thành  -> xanh lá (success)
 * - Bước đang thực hiện -> màu thương hiệu (primary)
 * - Bước chưa tới       -> xám nhạt (disabled)
 *
 * Toàn bộ giá trị được lấy từ `@/theme/colors` để đồng bộ với UI của app.
 */
export const stepProgressColors = {
  // --- Bước đang thực hiện (active) ---
  activeStepIconColor: colors.primary.main,
  activeStepIconBorderColor: colors.primary.main,
  activeStepNumColor: colors.neutral.white,
  activeLabelColor: colors.primary.main,

  // --- Bước đã hoàn thành (completed) ---
  completedStepIconColor: colors.status.success,
  completedStepNumColor: colors.neutral.white,
  completedCheckColor: colors.neutral.white,
  completedProgressBarColor: colors.status.success,
  completedLabelColor: colors.status.success,

  // --- Bước chưa tới (disabled / upcoming) ---
  disabledStepIconColor: colors.neutral.gray[300],
  disabledStepNumColor: colors.neutral.gray[600],
  progressBarColor: colors.neutral.gray[300],
  labelColor: colors.text.secondary,
} as const;

/**
 * Các "mẫu" (preset) style cho nút hành động trong từng bước.
 * Mỗi variant gồm class Tailwind cho container/text và mã màu cho icon/spinner.
 *
 * Dùng chung một hệ variant giống `ActionButtonBottom` để tái sử dụng dễ dàng.
 */
export type StepButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "outline";

interface StepButtonVariantStyle {
  /** Class Tailwind cho container (nền, viền). */
  container: string;
  /** Class Tailwind cho text. */
  text: string;
  /** Màu icon / spinner (loading). */
  contentColor: string;
}

export const stepButtonVariants: Record<
  StepButtonVariant,
  StepButtonVariantStyle
> = {
  primary: {
    container: "bg-[#6a5af9] border border-transparent",
    text: "text-white",
    contentColor: colors.neutral.white,
  },
  secondary: {
    container: "bg-amber-500 border border-transparent",
    text: "text-white",
    contentColor: colors.neutral.white,
  },
  success: {
    container: "bg-[#28a745] border border-transparent",
    text: "text-white",
    contentColor: colors.neutral.white,
  },
  danger: {
    container: "bg-[#dc3545] border border-transparent",
    text: "text-white",
    contentColor: colors.neutral.white,
  },
  outline: {
    container: "bg-white border border-gray-300",
    text: "text-gray-700",
    contentColor: colors.text.primary,
  },
};
