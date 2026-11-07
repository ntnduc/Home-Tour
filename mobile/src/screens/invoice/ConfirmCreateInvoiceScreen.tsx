import { createInvoice } from "@/api/invoice/invoice.api";
import ActionButtonBottom from "@/components/ActionButtonBottom";
import DisplayField from "@/components/DisplayField";
import FormScreen from "@/components/FormScreen";
import FormSection from "@/components/FormSection";
import Loading from "@/components/Loading";
import { ServiceCalculateMethod } from "@/constant/service.constant";
import { RootStackParamList } from "@/navigation/types";
import ConfirmCreateSummaryCard from "@/screens/invoice/components/create/ConfirmCreateSummaryCard";
import ServiceDetailInvoiceItemComponent from "@/screens/invoice/components/ServiceDetailInvoiceItemComponent";
import { tokens, uiColors, uiType } from "@/theme";
import { InvoiceItemType } from "@/types/invoice.item";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type ConfirmCreateInvoiceScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "ConfirmCreateInvoice"
  >;
  route: { params: RootStackParamList["ConfirmCreateInvoice"] };
};

/**
 * Review step for a manually built invoice before it is created.
 * Keeps the native stack header ("Xác Nhận Tạo Hóa Đơn"); the body scrolls inside FormScreen.
 *
 * ```
 * FormScreen (canvas · gutter 20 · gap 12 · keyboard-aware)
 * ┌ ConfirmCreateSummaryCard ───────────────────────┐
 * │ ▣ Xác nhận tạo hóa đơn          [Chỉnh sửa]     │
 * │ ┌ amount tile · TỔNG TIỀN CẦN THU ───────────┐  │
 * │ └────────────────────────────────────────────┘  │
 * │ Tiền thuê / Dịch vụ                             │
 * └─────────────────────────────────────────────────┘
 * ┌ FormSection ▣ Thông tin hợp đồng ───────────────┐
 * ┌ FormSection ▣ Thông tin thanh toán ─────────────┐  note block only when notes
 * ┌ FormSection ▣ Chi tiết dịch vụ ─────────────────┐  rows or empty caption
 * ┌ FormSection ▣ Tóm tắt thanh toán ───────────────┐  hairline · Tổng cộng (primary)
 * ├──────────────────────────────────────────────────┤
 * │ [Xác nhận tạo hóa đơn]  [Chỉnh sửa thông tin]    │ ActionButtonBottom (sticky footer)
 * └──────────────────────────────────────────────────┘
 * ```
 * Display-only derived values are built after the frozen submitting branch.
 */
const ConfirmCreateInvoiceScreen = ({
  navigation,
  route,
}: ConfirmCreateInvoiceScreenProps) => {
  const { invoice } = route.params;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Tính toán giá từng dịch vụ và tổng tiền
  const calculatedInvoiceData = useMemo(() => {
    if (!invoice.invoiceItems || invoice.invoiceItems.length === 0) {
      return {
        invoiceItemsWithTotal: invoice.invoiceItems || [],
        totalServiceAmount: 0,
        totalAmount: 0,
      };
    }

    //#region  Tính toán giá từng dịch vụ
    const invoiceItemsWithTotal = invoice.invoiceItems.map((item) => {
      // Nếu không phải service fee, giữ nguyên
      if (item.type !== InvoiceItemType.SERVICE_FEE) {
        return { ...item, amount: Number(item.amount) };
      }

      // Tính toán cho service fee
      let serviceAmount = 0;
      const helperValue = Number(item.helperValue);
      let oldHelperValue = Number(item.oldHelperValue);
      const newHelperValue = Number(item.newHelperValue);
      const amount = Number(item.amount);

      switch (item.calculationMethod) {
        case ServiceCalculateMethod.FIXED_PER_ROOM:
          serviceAmount = amount || 0;
          break;
        case ServiceCalculateMethod.FIXED_PER_NUMBER:
          serviceAmount = (amount || 0) * (helperValue || 0);
          break;
        case ServiceCalculateMethod.FIXED_PER_PERSON:
          // Use oldHelperValue as it's the value from the form
          serviceAmount = (amount || 0) * (helperValue || 0);
          break;
        case ServiceCalculateMethod.PER_UNIT_SIMPLE:
          const preHelperValue = newHelperValue ?? oldHelperValue ?? 0;
          serviceAmount = (amount || 0) * (helperValue - preHelperValue || 0);
          oldHelperValue = newHelperValue;
          break;
        default:
          serviceAmount = 0;
          break;
      }

      return {
        ...item,
        helperValue,
        oldHelperValue,
        newHelperValue,
        amount,
        totalAmount: serviceAmount,
      };
    });
    //#endregion

    // Tính tổng tiền dịch vụ
    const totalServiceAmount =
      invoiceItemsWithTotal
        .filter((item) => item.type === InvoiceItemType.SERVICE_FEE)
        .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0) || 0;

    // Tính tổng tiền cuối cùng (dịch vụ + tiền thuê)
    const totalAmount =
      totalServiceAmount +
      (Number(
        invoiceItemsWithTotal.find(
          (item) => item.type === InvoiceItemType.ROOM_RENT,
        )?.amount || 0,
      ) || 0);

    return {
      invoiceItemsWithTotal,
      totalServiceAmount,
      totalAmount,
    };
  }, [invoice.invoiceItems]);

  // Tính tổng tiền dịch vụ
  const totalServiceAmount = calculatedInvoiceData.totalServiceAmount;

  const onEdit = () => {
    navigation.goBack();
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Tạo invoice object với dữ liệu đã được tính toán

      const invoiceToSubmit = {
        ...invoice,
        invoiceItems: calculatedInvoiceData.invoiceItemsWithTotal,
        totalAmount: calculatedInvoiceData.totalAmount,
      };
      const response = await createInvoice(invoiceToSubmit);
      if (response.success && response.data) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Tạo hóa đơn thành công",
        });
        navigation.popToTop();
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: response.message ?? "Tạo hóa đơn thất bại!",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.response?.data?.message ?? "Tạo hóa đơn thất bại!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <Loading />;
  }

  // Display-only values derived from the frozen calculations above
  const roomRentText = `${formatCurrency((invoice.invoiceItems?.find((item) => item.type === InvoiceItemType.ROOM_RENT)?.amount || 0).toString())}đ`;
  const serviceText = `${formatCurrency(totalServiceAmount.toString())}đ`;
  const totalText = `${formatCurrency(calculatedInvoiceData.totalAmount.toString())}đ`;
  const serviceItems = calculatedInvoiceData.invoiceItemsWithTotal.filter(
    (item) => item.type === InvoiceItemType.SERVICE_FEE,
  );

  return (
    <FormScreen
      footer={
        <ActionButtonBottom
          actions={[
            {
              label: "Xác nhận tạo hóa đơn",
              icon: "checkmark-circle",
              variant: "success",
              isLoading: isSubmitting,
              onPress: onSubmit,
            },
            {
              label: "Chỉnh sửa thông tin",
              icon: "create-outline",
              variant: "secondary",
              onPress: onEdit,
            },
          ]}
        />
      }
    >
      <ConfirmCreateSummaryCard
        totalText={totalText}
        roomRentText={roomRentText}
        serviceText={serviceText}
        onEdit={onEdit}
      />

      <FormSection title="Thông tin hợp đồng" icon="reader-outline">
        <DisplayField
          label="Phòng"
          value={invoice.roomName || "-"}
          strong
          compact
        />
        <DisplayField
          label="Người thuê"
          value={invoice.clientName || "-"}
          compact
        />
      </FormSection>

      <FormSection title="Thông tin thanh toán" icon="calendar-outline">
        <DisplayField
          label="Hóa đơn tháng"
          value={invoice.paymentMonth ? `Tháng ${invoice.paymentMonth}` : "-"}
          compact
        />
        <DisplayField
          label="Hạn thanh toán"
          value={invoice.dueDate ? formatDate(invoice.dueDate.toString()) : "-"}
          compact
        />
        {invoice.notes ? (
          <>
            <View style={styles.divider} />
            <DisplayField
              direction="vertical"
              label="Ghi chú"
              value={invoice.notes}
              compact
            />
          </>
        ) : null}
      </FormSection>

      <FormSection
        title="Chi tiết dịch vụ"
        icon="flash-outline"
        caption="Các dịch vụ được tính trong hóa đơn này"
      >
        {serviceItems.length === 0 ? (
          <Text style={uiType.caption}>Không có dịch vụ nào</Text>
        ) : (
          <View>
            {serviceItems.map((calc, idx) => (
              <ServiceDetailInvoiceItemComponent
                key={`${calc.contractServiceId || idx + 1}`}
                data={calc}
                isLast={idx === serviceItems.length - 1}
              />
            ))}
          </View>
        )}
      </FormSection>

      <FormSection title="Tóm tắt thanh toán" icon="calculator-outline">
        <View style={styles.row}>
          <Text style={uiType.body}>Tiền thuê</Text>
          <Text style={uiType.bodyStrong}>{roomRentText}</Text>
        </View>
        <View style={styles.row}>
          <Text style={uiType.body}>Dịch vụ</Text>
          <Text style={uiType.bodyStrong}>{serviceText}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={uiType.bodyStrong}>Tổng cộng</Text>
          <Text style={[uiType.section, styles.total]}>{totalText}</Text>
        </View>
      </FormSection>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: uiColors.hairline,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: uiColors.hairline,
  },
  total: {
    color: tokens.colors.primary,
  },
});

export default ConfirmCreateInvoiceScreen;
