import { semantic } from "./tokens";

/**
 * SEMANTIC TOKENS (lớp 2 — token mang NGỮ NGHĨA).
 *
 * Đây là thứ UI nên tham chiếu (qua class Tailwind `bg-primary`, `text-muted`...
 * hoặc import `tokens` từ `@/theme` khi buộc phải truyền màu vào prop thư viện).
 *
 * Giá trị thật nằm ở `./tokens`. Tên semantic được đặt CỐ ĐỊNH để sau thêm dark
 * mode chỉ cần bổ sung bảng tối, không phải sửa UI.
 */
export const semanticColors = semantic;

export type SemanticColors = typeof semanticColors;
