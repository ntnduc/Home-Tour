import Input from "@/components/Input";
import { tokens } from "@/theme";
import { InvoiceDetailResponse } from "@/types/invoice";
import {
  InvoiceItemDetailResponse,
  InvoiceItemType,
  ITEM_TYPE_LABEL,
} from "@/types/invoice.item";
import { formatCurrency } from "@/utils/appUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useImperativeHandle } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Text, View } from "react-native";

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
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-gray-500">
            Chưa có khoản mục nào để cập nhật
          </Text>
        </View>
      );
    }

    return (
      <BottomSheetScrollView
        className="p-4"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        <View className="gap-4">
          {fields.map((field, index) => {
            const item = invoiceItems[index];
            return (
              <View
                key={field.fieldId}
                className="flex-row items-start gap-3 pb-4 border-b border-gray-100"
              >
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mt-1">
                  <Ionicons
                    name={
                      item.type === InvoiceItemType.ROOM_RENT
                        ? "home-outline"
                        : "construct-outline"
                    }
                    size={16}
                    color={tokens.colors.muted}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium text-gray-900 mb-1"
                    numberOfLines={1}
                  >
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
        </View>
      </BottomSheetScrollView>
    );
  },
);

export default UpdateInvoiceItemsPrice;
