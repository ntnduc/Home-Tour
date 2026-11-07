/**
 * INVITE MEMBER SHEET — body of the global bottom sheet opened by the "+" header button.
 *
 * ```
 * AppSheetScrollView · padding 16 · gap 16
 * ╭────────────────────────────────────────────╮ NoticeBanner info
 * │ Người được mời phải có tài khoản ...       │
 * ╰────────────────────────────────────────────╯
 * Số điện thoại *                               Input (phone-pad)
 * ┌────────────────────────────────────────────┐
 * │ 0901 234 567                               │
 * └────────────────────────────────────────────┘
 * ╭ ⚠ Số điện thoại chưa đăng ký tài khoản ╮     NoticeBanner warning (server answer)
 * [ ✉ Gửi lời mời ]                             Button primary (loading while checking)
 * ```
 */

import AppSheetScrollView from "@/components/AppSheet/AppSheetScrollView";
import Button from "@/components/Button";
import Input from "@/components/Input";
import NoticeBanner from "@/components/NoticeBanner";
import { uiSpace } from "@/theme";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { StyleSheet } from "react-native";

type Props = {
  /** Rejects with a user-facing Vietnamese message. */
  onInvite: (phone: string) => Promise<void>;
  onDone: () => void;
};

const PHONE_REGEX = /^(0|\+?84)\d{9}$/;

const InviteMemberSheet = ({ onInvite, onDone }: Props) => {
  const [phone, setPhone] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [serverError, setServerError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const normalized = phone.replace(/[\s.-]/g, "");
    setServerError(undefined);
    if (!PHONE_REGEX.test(normalized)) {
      setFieldError("Số điện thoại không hợp lệ");
      return;
    }
    setFieldError(undefined);
    setIsSubmitting(true);
    try {
      await onInvite(normalized);
      onDone();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Đã có lỗi xảy ra",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppSheetScrollView contentContainerStyle={styles.content}>
      <NoticeBanner
        tone="info"
        message="Người được mời cần có tài khoản trong hệ thống và phải chấp nhận lời mời trước khi bạn chỉnh quyền."
      />
      <Input
        label="Số điện thoại"
        required
        type="text"
        keyboardType="phone-pad"
        inputComponent={BottomSheetTextInput}
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          setFieldError(undefined);
          setServerError(undefined);
        }}
        placeholder="Nhập số điện thoại"
        error={fieldError}
        maxLength={16}
      />
      {serverError && <NoticeBanner tone="warning" message={serverError} />}
      <Button
        label="Gửi lời mời"
        icon="paper-plane"
        isLoading={isSubmitting}
        loadingLabel="Đang kiểm tra..."
        disabled={isSubmitting || phone.trim().length === 0}
        onPress={submit}
      />
    </AppSheetScrollView>
  );
};

const styles = StyleSheet.create({
  content: { padding: uiSpace.card, gap: uiSpace.card },
});

export default InviteMemberSheet;
