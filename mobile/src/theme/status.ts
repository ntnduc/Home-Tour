import { palette } from "./primitives";
import { semanticColors as c } from "./semantic";

/**
 * STATUS COLORS — nguồn chân lý DUY NHẤT cho màu badge trạng thái (bg + text).
 *
 * Trước đây màu trạng thái bị LẶP y hệt ở `types/invoice.ts` và `types/payment.ts`
 * (hardcode hex). Nay gom về đây, map theo semantic token để đồng bộ toàn app.
 *
 * Mỗi mục gồm:
 *  - `bg`:   nền nhạt (dùng *Surface của semantic).
 *  - `color`: màu chữ/icon (chọn tông đủ tương phản trên nền nhạt).
 */
export const statusColor = {
  draft: { bg: c.draftSurface, color: c.draft },
  pending: { bg: c.warningSurface, color: palette.amber[500] },
  success: { bg: c.successSurface, color: c.success },
  info: { bg: c.infoSurface, color: palette.blue[500] },
  error: { bg: c.errorSurface, color: c.error },
  cancelled: { bg: palette.gray[100], color: palette.gray[600] },
} as const;

export type StatusColorKey = keyof typeof statusColor;
export type StatusColorValue = { bg: string; color: string };
