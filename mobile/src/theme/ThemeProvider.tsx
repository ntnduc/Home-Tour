import React, { createContext, useContext } from "react";
import { tokens, Tokens } from "./index";

/**
 * ThemeProvider / useTheme
 *
 * Trả về design token (light). Trước đây file này chứa một bản SAO CHÉP toàn bộ
 * token kèm nhánh dark mode không được mount ở đâu (code chết) + tàn dư Tamagui.
 * Nay đã gỡ: nguồn chân lý duy nhất là `@/theme` (xem `tokens`).
 *
 * Giữ Context để sau này thêm dark mode chỉ cần đổi `value` tại đây, KHÔNG phải
 * sửa các component đang gọi `useTheme()`.
 */
const ThemeContext = createContext<Tokens>(tokens);

export const useTheme = (): Tokens => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => (
  <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>
);
