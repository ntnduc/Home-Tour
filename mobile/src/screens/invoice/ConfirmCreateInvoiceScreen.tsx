import { createInvoice } from "@/api/invoice/invoice.api";
import ActionButtonBottom from "@/components/ActionButtonBottom";
import Loading from "@/components/Loading";
import { ServiceCalculateMethod } from "@/constant/service.constant";
import { RootStackParamList } from "@/navigation/types";
import CardComponent from "@/screens/common/CardComponent";
import ServiceDetailInvoiceItemComponent from "@/screens/invoice/components/ServiceDetailInvoiceItemComponent";
import { InvoiceItemType } from "@/types/invoice.item";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

type ConfirmCreateInvoiceScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "ConfirmCreateInvoice"
  >;
  route: { params: RootStackParamList["ConfirmCreateInvoice"] };
};

// type ServiceCalculation = {
//   item: InvoiceItemCreateRequest;
//   amount: number;
// };

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

  const renderRow = (
    label: string,
    value?: string | number,
    strong?: boolean,
  ) => (
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-base text-gray-600">{label}</Text>
      <Text
        className={`text-base ${strong ? "font-semibold text-gray-900" : "text-gray-900"}`}
      >
        {value}
      </Text>
    </View>
  );

  if (isSubmitting) {
    return <Loading />;
  }

  return (
    <>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
        enableOnAndroid={true}
        extraScrollHeight={30}
        keyboardOpeningTime={0}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header tổng quan */}
        <CardComponent>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                Xác nhận tạo hóa đơn
              </Text>
              <Text className="text-sm text-gray-600">
                Kiểm tra kỹ các thông tin trước khi xác nhận
              </Text>
            </View>
            <TouchableOpacity
              onPress={onEdit}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200"
            >
              <View className="flex-row items-center">
                <Ionicons name="create-outline" size={16} color="#374151" />
                <Text className="text-gray-700 text-sm font-medium ml-1">
                  Chỉnh sửa
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </CardComponent>

        {/* Tổng tiền cần thu - nhấn mạnh */}
        <CardComponent>
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="receipt-outline" size={20} color="#1E40AF" />
                <Text className="ml-2 text-sm font-semibold text-blue-700">
                  Tổng tiền cần thu
                </Text>
              </View>
            </View>
            <Text className="text-3xl font-extrabold text-blue-700 text-center">
              {formatCurrency(calculatedInvoiceData.totalAmount.toString())}đ
            </Text>
            <View className="mt-3 pt-3 border-t border-blue-200">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs text-blue-600">Tiền thuê</Text>
                <Text className="text-sm font-semibold text-blue-700">
                  {formatCurrency(
                    (
                      invoice.invoiceItems?.find(
                        (item) => item.type === InvoiceItemType.ROOM_RENT,
                      )?.amount || 0
                    ).toString(),
                  )}
                  đ
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-blue-600">Dịch vụ</Text>
                <Text className="text-sm font-semibold text-blue-700">
                  {formatCurrency(totalServiceAmount.toString())}đ
                </Text>
              </View>
            </View>
          </View>
        </CardComponent>

        {/* Thông tin hợp đồng */}
        <CardComponent title="Thông tin hợp đồng">
          <View>
            {renderRow("Phòng", invoice.roomName || "-", true)}
            {renderRow("Người thuê", invoice.clientName || "-")}
          </View>
        </CardComponent>

        {/* Thông tin thanh toán */}
        <CardComponent title="Thông tin thanh toán">
          <View>
            {renderRow(
              "Hóa đơn tháng",
              invoice.paymentMonth ? `Tháng ${invoice.paymentMonth}` : "-",
            )}
            {renderRow(
              "Hạn thanh toán",
              invoice.dueDate ? formatDate(invoice.dueDate.toString()) : "-",
            )}
            {invoice.notes && (
              <>
                <View className="h-[1px] bg-gray-200 my-2" />
                <View>
                  <Text className="text-sm text-gray-600 mb-1">Ghi chú</Text>
                  <Text className="text-base text-gray-900">
                    {invoice.notes}
                  </Text>
                </View>
              </>
            )}
          </View>
        </CardComponent>

        {/* Chi tiết dịch vụ */}
        <CardComponent
          title="Chi tiết dịch vụ"
          description="Các dịch vụ được tính trong hóa đơn này"
        >
          {calculatedInvoiceData.invoiceItemsWithTotal.filter(
            (item) => item.type === InvoiceItemType.SERVICE_FEE,
          )?.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="construct-outline" size={22} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500">Không có dịch vụ nào</Text>
            </View>
          ) : (
            <View className="flex flex-col">
              {calculatedInvoiceData.invoiceItemsWithTotal
                .filter((item) => item.type === InvoiceItemType.SERVICE_FEE)
                ?.map((calc, idx) => (
                  <ServiceDetailInvoiceItemComponent
                    key={`${calc.contractServiceId || idx + 1}`}
                    data={calc}
                    isLast={
                      idx ===
                      (calculatedInvoiceData.invoiceItemsWithTotal.filter(
                        (item) => item.type === InvoiceItemType.SERVICE_FEE,
                      )?.length || 0) -
                        1
                    }
                  />
                ))}
            </View>
          )}
        </CardComponent>

        {/* Tóm tắt thanh toán */}
        <CardComponent title="Tóm tắt thanh toán">
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-gray-600">Tiền thuê</Text>
              <Text className="text-base font-semibold text-gray-900">
                {formatCurrency(
                  (
                    invoice?.invoiceItems?.find(
                      (item) => item.type === InvoiceItemType.ROOM_RENT,
                    )?.amount || 0
                  ).toString(),
                )}
                đ
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-gray-600">Dịch vụ</Text>
              <Text className="text-base font-semibold text-gray-900">
                {formatCurrency(totalServiceAmount.toString())}đ
              </Text>
            </View>
            <View className="h-[1px] bg-gray-200 my-2" />
            <View className="flex-row justify-between items-center pt-2">
              <Text className="text-lg font-bold text-gray-900">Tổng cộng</Text>
              <Text className="text-xl font-extrabold text-blue-600">
                {formatCurrency(calculatedInvoiceData.totalAmount.toString())}đ
              </Text>
            </View>
          </View>
        </CardComponent>
      </KeyboardAwareScrollView>

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
    </>
  );
};

export default ConfirmCreateInvoiceScreen;
