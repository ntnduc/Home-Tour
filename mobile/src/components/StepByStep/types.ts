import { Ionicons } from '@expo/vector-icons';
import { StepButtonVariant } from './colors';

/**
 * Kết quả trả về từ `onPress` của một action.
 * - `false`            -> CHẶN việc chuyển bước (ví dụ: API trả lỗi / validate fail).
 * - `void` | `true`    -> Cho phép chuyển bước.
 */
export type StepActionResult = void | boolean;

/**
 * Cấu hình cho một nút hành động (next / previous / finish) trong mỗi bước.
 *
 * Chỉ cần truyền các field cần thiết, phần còn lại đã có giá trị mặc định.
 */
export interface StepActionConfig {
  /** Nhãn nút. */
  label?: string;
  /** Nhãn hiển thị khi đang loading (mặc định: "Đang xử lý..."). */
  loadingText?: string;
  /** Chọn "mẫu" style có sẵn. */
  variant?: StepButtonVariant;
  /** Icon Ionicons hiển thị kèm nhãn. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Vị trí icon so với nhãn. */
  iconPosition?: 'left' | 'right';
  /** Vô hiệu hoá nút. */
  disabled?: boolean;
  /** Ẩn hoàn toàn nút. */
  hidden?: boolean;
  /** Class Tailwind bổ sung để tuỳ biến (custom). */
  className?: string;
  /**
   * Xử lý khi nhấn nút. Có thể là hàm đồng bộ hoặc bất đồng bộ.
   *
   * - Khi async: nút tự động hiển thị loading trong lúc chờ, và chỉ chuyển bước
   *   sau khi Promise resolve thành công.
   * - Trả về `false` (hoặc throw / reject) để giữ nguyên bước hiện tại.
   */
  onPress?: () => StepActionResult | Promise<StepActionResult>;
}

/** Định danh action đang loading. */
export type StepActionKey = 'next' | 'previous' | 'finish';
