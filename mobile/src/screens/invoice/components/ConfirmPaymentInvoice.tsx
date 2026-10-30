import { ComboBox } from "@/components/ComboBox";
import DatePicker from "@/components/DatePicker";
import IconSquircle from "@/components/IconSquircle";
import Input from "@/components/Input";
import { Switch } from "@/components/Switch";
import { tokens, uiColors, uiRadius, uiSpace, uiType } from "@/theme";
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
import { StyleSheet, Text, View } from "react-native";

type Props = {
  invoice: InvoiceDetailResponse;
  onSubmit?: (data: InvoicePaymentRequest) => void | Promise<void>;
};

export interface ConfirmPaymentInvoiceRef {
  submit: () => void;
}

// Bottom padding under the last field so the BottomSheetFooter never covers it
const SHEET_FOOTER_CLEARANCE = 120;

/**
 * Record-payment bottom sheet form (opened from the invoice detail).
 *
 * ```
 * ┌ amount tile · canvas · radius 20 · p16 ─────────┐
 * │ ▣ wallet   SỐ TIỀN CÒN LẠI                       │
 * │            2.500.000đ  (info)                    │
 * └──────────────────────────────────────────────────┘
 * Money group (gap 12)
 *   Số tiền thanh toán *  (Input)
 *   ┌ carry box · only when partial ─────────────────┐
 *   │ Ghi nợ vào tháng sau   (Switch)                │
 *   │ Còn thiếu: 500.000đ    (amber caption)         │
 *   └────────────────────────────────────────────────┘
 * ───────────── hairline ─────────────
 * Details group (gap 12)
 *   Ngày thanh toán *  (DatePicker, disabled)
 *   Phương thức thanh toán *  (ComboBox)
 *   Ghi chú  (Input area)
 * ```
 * Footer (Hủy / Xác nhận) is rendered by the sheet host, not here.
 */
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
            notes: data.note,
          };
          onSubmit?.(submitData);
        })();
      },
    }));

    return (
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tile}>
          <IconSquircle icon="wallet-outline" tone="info" size="md" />
          <View style={styles.tileText}>
            <Text style={uiType.eyebrow}>Số tiền còn lại</Text>
            <Text
              style={styles.tileAmount}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(invoice.remainingAmount.toString())}đ
            </Text>
          </View>
        </View>

        <View style={styles.group}>
          <Controller
            control={control}
            name="amount"
            rules={{
              required: "Vui lòng nhập số tiền",
              min: { value: 1, message: "Số tiền phải lớn hơn 0" },
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
            <View style={styles.carryBox}>
              <Controller
                control={control}
                name="isCarryOver"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    label="Ghi nợ vào tháng sau"
                    value={value ?? true}
                    onValueChange={onChange}
                    alignLabel="horizontal"
                  />
                )}
              />
              <Text style={styles.shortfall}>
                Còn thiếu:{" "}
                {formatCurrency(
                  String(invoice.remainingAmount - (amount ?? 0)),
                )}
                đ
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.group}>
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

const styles = StyleSheet.create({
  content: {
    padding: uiSpace.card,
    paddingBottom: SHEET_FOOTER_CLEARANCE,
    gap: 16,
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: uiColors.canvas,
    borderRadius: uiRadius.tile,
    padding: uiSpace.card,
  },
  tileText: {
    flex: 1,
    gap: 2,
  },
  tileAmount: {
    ...uiType.title,
    color: tokens.colors.info,
  },
  group: {
    gap: uiSpace.gap,
  },
  carryBox: {
    backgroundColor: uiColors.canvas,
    borderRadius: uiRadius.field,
    padding: 12,
    gap: 4,
  },
  shortfall: {
    ...uiType.caption,
    color: tokens.palette.amber[500],
  },
  divider: {
    height: 1,
    backgroundColor: uiColors.hairline,
  },
});

export default ConfirmPaymentInvoice;
