import { palette as rawPalette } from "./tokens";

/**
 * PRIMITIVE TOKENS (lớp 1 — palette "thô" theo thang bậc).
 *
 * Giá trị thật nằm ở `./tokens` (CommonJS, dùng chung với tailwind.config.js).
 * File này chỉ re-export kèm kiểu để code TypeScript dùng thuận tiện.
 *
 * KHÔNG dùng primitive trực tiếp trong UI — hãy dùng semantic token
 * (`./semantic`) hoặc class Tailwind tương ứng (vd `bg-primary`).
 */
export const palette = rawPalette;

export type Palette = typeof palette;
