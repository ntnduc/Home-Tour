import IconSquircle from "@/components/IconSquircle";
import Input from "@/components/Input";
import { uiColors, uiSpace, uiType } from "@/theme";
import { InvoiceDetailResponse } from "@/types/invoice";
import {
  InvoiceItemDetailResponse,
  InvoiceItemType,
  ITEM_TYPE_LABEL,
} from "@/types/invoice.item";
import { formatCurrency } from "@/utils/appUtil";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import AppSheetScrollView, {
  SHEET_FOOTER_CLEARANCE,
} from "@/components/AppSheet/AppSheetScrollView";
import React, { forwardRef, useImperativeHandle } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

export interface InvoiceItemPriceFormValues {
  invoiceItems: {
    id: string;
    totalAmount: number;
  }[];
}

type Props = {
  invoice: InvoiceDetailResponse;
  onSubmit?: (items: InvoiceItemDetailResponse[]) => void | Promise<void>;
};

export interface UpdateInvoiceItemsPriceRef {
  submit: () => void;
}

/**
 * Edit-item-prices bottom sheet (opened from the draft invoice).
 *
 * ```
 * AppSheetScrollView · padding 16 · paddingBottom 120
 * ▣  Tiền thuê phòng                 IconSquircle sm + name (bodyStrong)
 *    [ 💵 2.500.000 ]                Input (number)
 * ───────────────────────────────    hairline between rows
 * ▣  Điện
 *    [ 💵 350.000 ]
 * ```
 * Empty → centered caption.
 */
const UpdateInvoiceItemsPrice = forwardRef<UpdateInvoiceItemsPriceRef, Props>(
  (props: Props, ref) => {
    const { invoice, onSubmit } = props;
    const invoiceItems = (invoice.invoiceItems ??
      []) as InvoiceItemDetailResponse[];

    const { control, handleSubmit } = useForm<InvoiceItemPriceFormValues>({
      defaultValues: {
        invoiceItems: invoiceItems.map((item) => ({
          id: item.id,
          totalAmount: item.totalAmount ?? item.amount ?? 0,
        })),
      },
    });

    const { fields } = useFieldArray({
      control,
      name: "invoiceItems",
      keyName: "fieldId",
    });

    useImperativeHandle(ref, () => ({
      submit() {
        handleSubmit((data) => {
          const updatedItems = invoiceItems.map((item, index) => ({
            ...item,
            totalAmount:
              data.invoiceItems[index]?.totalAmount ??
              item.totalAmount ??
              item.amount ??
              0,
          }));
          onSubmit?.(updatedItems);
        })();
      },
    }));

    if (invoiceItems.length === 0) {
      return (
        <View style={styles.empty}>
          <Text style={uiType.caption}>Chưa có khoản mục nào để cập nhật</Text>
        </View>
      );
    }

    return (
      <AppSheetScrollView contentContainerStyle={styles.content}>
        {fields.map((field, index) => {
          const item = invoiceItems[index];
          return (
            <View
              key={field.fieldId}
              style={[styles.row, index > 0 && styles.divider]}
            >
              <IconSquircle
                icon={
                  item.type === InvoiceItemType.ROOM_RENT
                    ? "home-outline"
                    : "construct-outline"
                }
                tone="neutral"
                size="sm"
              />
              <View style={styles.main}>
                <Text style={uiType.bodyStrong} numberOfLines={1}>
                  {item.name || ITEM_TYPE_LABEL[item.type]}
                </Text>
                <Controller
                  control={control}
                  name={`invoiceItems.${index}.totalAmount`}
                  rules={{
                    required: "Vui lòng nhập giá",
                    min: { value: 0, message: "Giá không được nhỏ hơn 0" },
                  }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <Input
                      inputComponent={BottomSheetTextInput}
                      value={
                        value != null ? formatCurrency(value.toString()) : ""
                      }
                      onChangeText={(text) => {
                        const numValue = parseFloat(
                          text.replace(/[.,]/g, "") || "0",
                        );
                        onChange(numValue);
                      }}
                      placeholder="Nhập giá"
                      type="number"
                      keyboardType="numeric"
                      icon="cash"
                      error={error?.message}
                    />
                  )}
                />
              </View>
            </View>
          );
        })}
      </AppSheetScrollView>
    );
  },
);

const styles = StyleSheet.create({
  content: {
    padding: uiSpace.card,
    paddingBottom: SHEET_FOOTER_CLEARANCE,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: uiSpace.section,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: uiSpace.gap,
    paddingVertical: uiSpace.gap,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: uiColors.hairline,
  },
  main: {
    flex: 1,
    gap: 6,
  },
});

export default UpdateInvoiceItemsPrice;
