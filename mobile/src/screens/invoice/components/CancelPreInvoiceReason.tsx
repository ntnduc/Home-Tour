import Input from "@/components/Input";
import NoticeBanner from "@/components/NoticeBanner";
import { uiSpace } from "@/theme";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import AppSheetScrollView, {
  SHEET_FOOTER_CLEARANCE,
} from "@/components/AppSheet/AppSheetScrollView";
import React, { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";

type FormValues = { reason: string };

type Props = {
  onSubmit: (reason: string) => void | Promise<void>;
};

export interface CancelPreInvoiceReasonRef {
  submit: () => void;
}

const MAX_REASON_LENGTH = 500;

/**
 * Bottom-sheet form collecting the required reason for cancelling a pre-invoice.
 * Header and footer (Xác nhận hủy) are owned by the host sheet.
 *
 * ```
 * AppSheetScrollView · padding 16 · paddingBottom 120 · gap 16
 * ╭─────────────────────────────────────────────────────╮
 * │ (!)  Hóa đơn đầu tiên sẽ bị hủy và hợp đồng sẽ tiếp │ NoticeBanner warning
 * │      tục mà không cần thanh toán. Thao tác này ... │ (no title)
 * ╰─────────────────────────────────────────────────────╯
 * Lý do hủy *                                          Input type area
 * ┌─────────────────────────────────────────────────────┐
 * │ Nhập lý do hủy hóa đơn                              │
 * └─────────────────────────────────────────────────────┘
 * ```
 */
const CancelPreInvoiceReason = forwardRef<CancelPreInvoiceReasonRef, Props>(
  ({ onSubmit }, ref) => {
    const { control, handleSubmit } = useForm<FormValues>({
      defaultValues: { reason: "" },
    });

    useImperativeHandle(ref, () => ({
      submit() {
        handleSubmit((data) => onSubmit(data.reason.trim()))();
      },
    }));

    return (
      <AppSheetScrollView contentContainerStyle={styles.content}>
        <NoticeBanner
          tone="warning"
          icon="warning"
          message="Hóa đơn đầu tiên sẽ bị hủy và hợp đồng sẽ tiếp tục mà không cần thanh toán. Thao tác này không thể hoàn tác."
        />
        <Controller
          control={control}
          name="reason"
          rules={{
            validate: (value) => {
              const trimmed = value.trim();
              if (!trimmed) return "Vui lòng nhập lý do hủy";
              if (trimmed.length > MAX_REASON_LENGTH) {
                return `Lý do tối đa ${MAX_REASON_LENGTH} ký tự`;
              }
              return true;
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              label="Lý do hủy"
              type="area"
              inputComponent={BottomSheetTextInput}
              value={value}
              onChangeText={onChange}
              placeholder="Nhập lý do hủy hóa đơn"
              maxLength={MAX_REASON_LENGTH}
              required
              error={error?.message}
            />
          )}
        />
      </AppSheetScrollView>
    );
  },
);

const styles = StyleSheet.create({
  content: {
    padding: uiSpace.card,
    paddingBottom: SHEET_FOOTER_CLEARANCE,
    gap: 16,
  },
});

export default CancelPreInvoiceReason;
