import { ComboBox } from "@/components/ComboBox";
import DatePicker from "@/components/DatePicker";
import Input from "@/components/Input";
import { Switch } from "@/components/Switch";
import { InvoiceDetailResponse, InvoicePaymentRequest } from "@/types/invoice";
import {
  PAYMENT_METHOD_LABEL,
  PaymentCreateRequest,
  PaymentMethod,
} from "@/types/payment";
import { formatCurrency } from "@/utils/appUtil";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

type Props = {
  invoice: InvoiceDetailResponse;
  onSubmit?: (data: InvoicePaymentRequest) => void | Promise<void>;
};

export interface ConfirmPaymentInvoiceRef {
  submit: () => void;
}

const ConfirmPaymentInvoice = forwardRef<ConfirmPaymentInvoiceRef, Props>(
  (props: Props, ref) => {
    const { invoice, onSubmit } = props;
    const {
      control,
      handleSubmit,
      setValue,
      watch,
      reset,
      formState: { isSubmitting },
    } = useForm<PaymentCreateRequest>({
      defaultValues: {
        amount: invoice.remainingAmount,
        paymentDate: new Date(),
        paymentMethod: PaymentMethod.CASH,
        remainingAmount: invoice.remainingAmount,
        roomName: "",
        isCarryOver: true,
      },
    });

    const amount = watch("amount");
    const isPartialPayment = amount != null && amount < invoice.remainingAmount;

    useImperativeHandle(ref, () => ({
      submit() {
        handleSubmit((data) => {
          const submitData: InvoicePaymentRequest = {
            id: invoice.id as string,
            paymentMethod: data.paymentMethod ?? PaymentMethod.CASH,
            remainingAmount: data.remainingAmount,
            isCarryOver: data.isCarryOver,
            paidAmount: data.amount,
          };
          onSubmit?.(submitData);
        })();
      },
    }));

    return (
      <BottomSheetScrollView
        className="p-4"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        <View className="gap-2">
          <View>
            <Text className="text-sm text-gray-500 mb-1">Số tiền còn lại</Text>
            <Text className="text-2xl font-bold text-info">
              {formatCurrency(invoice.remainingAmount.toString())}đ
            </Text>
          </View>

          <Controller
            control={control}
            name="amount"
            rules={{
              required: "Vui lòng nhập số tiền",
              min: { value: 0, message: "Số tiền không được nhỏ hơn 0" },
              max: {
                value: invoice.remainingAmount,
                message: "Số tiền không được vượt quá số tiền còn lại",
              },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Số tiền thanh toán"
                value={value != null ? formatCurrency(value.toString()) : ""}
                onChangeText={(text) => {
                  const numValue = parseFloat(text.replace(/[.,]/g, "") || "0");
                  onChange(numValue);
                }}
                placeholder="Nhập số tiền"
                type="number"
                keyboardType="numeric"
                icon="cash"
                required
                error={error?.message}
              />
            )}
          />

          {isPartialPayment && (
            <Controller
              control={control}
              name="isCarryOver"
              render={({ field: { onChange, value } }) => (
                <Switch
                  label="Ghi nợ vào thánh sau"
                  value={value ?? true}
                  onValueChange={onChange}
                  alignLabel="horizontal"
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="paymentDate"
            rules={{ required: "Vui lòng chọn ngày thanh toán" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <DatePicker
                label="Ngày thanh toán"
                value={value}
                onChange={onChange}
                placeholder="Chọn ngày thanh toán"
                required
                disabled
                error={error?.message}
                icon="calendar"
                maxDate={new Date()}
              />
            )}
          />

          <Controller
            control={control}
            name="paymentMethod"
            rules={{ required: "Vui lòng chọn phương thức thanh toán" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <ComboBox
                value={value}
                options={Object.values(PaymentMethod).map((method) => ({
                  key: method,
                  label: PAYMENT_METHOD_LABEL[method],
                }))}
                isSearch={false}
                onChange={(option) => onChange(option.key)}
                placeholder="Chọn phương thức thanh toán"
                label="Phương thức thanh toán"
                required
                error={error?.message}
                labelKey="label"
                valueKey="key"
                icon="card-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <Input
                type="area"
                label="Ghi chú"
                value={value}
                onChangeText={onChange}
                placeholder="Nhập ghi chú"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          />
        </View>
      </BottomSheetScrollView>
    );
  },
);

export default ConfirmPaymentInvoice;
