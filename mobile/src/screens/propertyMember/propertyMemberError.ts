import { handleApiError } from "@/utils/apiUtil";
import axios from "axios";

/**
 * Prefer the backend's own (Vietnamese) message — e.g. "Số điện thoại chưa đăng ký
 * tài khoản" (404) or "Đã gửi lời mời cho người dùng này" (409) — which the shared
 * `handleApiError` collapses into a generic text for those status codes.
 */
export const getMemberErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] })
      ?.message;
    if (Array.isArray(message) && message.length > 0) return message[0];
    if (typeof message === "string" && message) return message;
  }
  // Plain Error thrown by our own code (already a user-facing message)
  if (error instanceof Error && !axios.isAxiosError(error))
    return error.message;
  return handleApiError(error).message;
};
