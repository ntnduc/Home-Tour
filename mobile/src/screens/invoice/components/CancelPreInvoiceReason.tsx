import Input from "@/components/Input";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text } from "react-native";

type FormValues = { reason: string };

type Props = {
  onSubmit: (reason: string) => void | Promise<void>;
};

export interface CancelPreInvoiceReasonRef {
  submit: () => void;
}

const MAX_REASON_LENGTH = 500;

/** Bottom-sheet form collecting the required reason for cancelling a pre-invoice. */
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
      <BottomSheetScrollView
        className="p-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-sm text-gray-500 mb-3">
          Hóa đơn đầu tiên sẽ bị hủy và hợp đồng sẽ tiếp tục mà không cần thanh
          toán. Thao tác này không thể hoàn tác.
        </Text>
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
              value={value}
              onChangeText={onChange}
              placeholder="Nhập lý do hủy hóa đơn"
              maxLength={MAX_REASON_LENGTH}
              required
              error={error?.message}
            />
          )}
        />
      </BottomSheetScrollView>
    );
  },
);

export default CancelPreInvoiceReason;
