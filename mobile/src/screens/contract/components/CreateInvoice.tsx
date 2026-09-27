import { createPayment, getInvoice } from "@/api/invoice/invoice.api";
import ActionButtonBottom from "@/components/ActionButtonBottom";
import { useGlobalAppSheet } from "@/components/GlobalAppSheet";
import Loading from "@/components/Loading";
import Status from "@/components/Status";
import { RootStackParamList } from "@/navigation/types";
import CardComponent from "@/screens/common/CardComponent";
import ConfirmPaymentInvoice, {
  ConfirmPaymentInvoiceRef,
} from "@/screens/invoice/components/ConfirmPaymentInvoice";
import {
  INVOICE_STATUS_OPTIONS,
  InvoiceDetailResponse,
  InvoiceStatus,
} from "@/types/invoice";
import {
  InvoiceItemDetailResponse,
  InvoiceItemType,
} from "@/types/invoice.item";
import {
  PaymentCreateRequest,
  PaymentStatus,
  PaymentType,
} from "@/types/payment";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetFooter } from "@gorhom/bottom-sheet";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

interface CreateInvoiceProps {
  navigation: NativeStackNavigationProp<RootStackParamList, "CreateContract">;
  /** Id của hóa đơn được backend tạo ra sau khi tạo hợp đồng. */
  invoiceId: string;
}

const formatDateSafe = (value?: string | Date) =>
  value ? formatDate(String(value)) : "-";

const CreateInvoice = ({ navigation, invoiceId }: CreateInvoiceProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [invoice, setInvoice] = useState<InvoiceDetailResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const refPaymentForm = useRef<ConfirmPaymentInvoiceRef>(null);
  const { openAppSheet, closeAppSheet } = useGlobalAppSheet();

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getInvoice(invoiceId);
      if (response.success && response.data) {
        setInvoice(response.data);
        return;
      }

      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: response.message ?? "Không thể tải thông tin hóa đơn",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2:
          error?.response?.data?.message ?? "Không thể tải thông tin hóa đơn",
      });
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleSavePayment = async (formData: PaymentCreateRequest) => {
    if (!invoice) return;

    const remainingAmount = invoice.remainingAmount ?? 0;

    if (!formData.paymentDate) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ngày thanh toán",
      });
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số tiền thanh toán phải lớn hơn 0",
      });
      return;
    }

    if (formData.amount > remainingAmount) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số tiền thanh toán không được vượt quá số tiền còn lại",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const paymentData: PaymentCreateRequest = {
        invoiceId: invoice.id,
        amount: formData.amount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        propertyId: invoice.propertyId,
        type: PaymentType.IN,
        status: PaymentStatus.PAID,
        note: formData.note,
        roomName: invoice.roomName ?? "",
      };

      const response = await createPayment(paymentData);
      if (response.success && response.data) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã ghi nhận thanh toán thành công",
        });
        await fetchInvoice();
      } else {
        throw new Error(response.message || "Không thể ghi nhận thanh toán");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.message || "Không thể ghi nhận thanh toán",
      });
    } finally {
      setIsSubmitting(false);
      closeAppSheet();
    }
  };

  const handleOpenPaymentForm = () => {
    if (!invoice) return;

    openAppSheet(
      <ConfirmPaymentInvoice
        ref={refPaymentForm}
        invoice={invoice}
        onSubmit={handleSavePayment}
      />,
      {
        snapPoints: ["80%"],
        detached: false,
        header: {
          title: "Ghi nhận thanh toán",
          onClose: () => {
            closeAppSheet();
          },
        },
        renderFooter: (props) => (
          <BottomSheetFooter {...props}>
            <ActionButtonBottom
              actions={[
                [
                  {
                    label: "Hủy",
                    icon: "close-circle",
                    variant: "danger",
                    onPress: () => {
                      closeAppSheet();
                    },
                  },
                  {
                    label: "Xác Nhận",
                    icon: "cash",
                    variant: "success",
                    isLoading: isSubmitting,
                    onPress: () => {
                      refPaymentForm.current?.submit();
                    },
                  },
                ],
              ]}
            />
          </BottomSheetFooter>
        ),
      },
    );
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
        {value ?? "-"}
      </Text>
    </View>
  );

  if (loading) {
    return <Loading />;
  }

  if (!invoice) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
          <Ionicons name="receipt-outline" size={26} color="#9CA3AF" />
        </View>
        <Text className="text-base font-semibold text-gray-900 mb-1">
          Không tìm thấy hóa đơn
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          Hóa đơn của hợp đồng chưa được tạo hoặc đã xảy ra lỗi khi tải dữ liệu.
        </Text>
      </View>
    );
  }

  const status = invoice.status ?? InvoiceStatus.DRAFT;
  // const statusColor = INVOICE_STATUS_COLOR[status];
  const invoiceItems = (invoice.invoiceItems ??
    []) as InvoiceItemDetailResponse[];

  return (
    <>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 16,
          paddingHorizontal: 16,
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
        {/* Thông báo tạo thành công */}
        <CardComponent>
          <View className="flex-row items-center w-full bg-green-50 border border-green-200 p-3 rounded-lg">
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            <Text className="text-sm text-green-700 ml-2 flex-1">
              Hợp đồng đã được tạo cùng hóa đơn đầu tiên. Kiểm tra lại thông tin
              bên dưới.
            </Text>
          </View>
        </CardComponent>

        {/* Tổng quan hóa đơn */}
        <CardComponent>
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-1">Mã hóa đơn</Text>
              <Text className="text-xl font-bold text-gray-900">
                {invoice.code || "Chưa cấp mã"}
              </Text>
            </View>
            <Status value={status} options={INVOICE_STATUS_OPTIONS} />
            {/* <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: statusColor.bg }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: statusColor.color }}
              >
                {INVOICE_STATUS_LABEL[status]}
              </Text>
            </View> */}
          </View>

          <View className="h-[1px] bg-gray-200 my-3" />

          <Text className="text-sm text-gray-600 mb-1">
            Số tiền cần thanh toán
          </Text>
          <Text className="text-3xl font-extrabold text-blue-700 text-center">
            {formatCurrency((invoice.remainingAmount || 0).toString())}đ
          </Text>
        </CardComponent>

        {/* Thông tin hợp đồng */}
        <CardComponent title="Thông tin hợp đồng">
          {renderRow("Phòng", invoice.roomName || "-", true)}
          {renderRow("Người thuê", invoice.clientName || "-")}
          {invoice.propertyName
            ? renderRow("Tòa nhà", invoice.propertyName)
            : null}
        </CardComponent>

        {/* Thông tin thanh toán */}
        <CardComponent title="Thông tin thanh toán">
          {/* {renderRow(
            "Hóa đơn tháng",
            invoice.paymentMonth ? `Tháng ${invoice.paymentMonth}` : "-",
          )} */}
          {renderRow(
            "Kỳ thanh toán",
            `${formatDateSafe(invoice.billingPeriodStart)} - ${formatDateSafe(
              invoice.billingPeriodEnd,
            )}`,
          )}
          {renderRow("Hạn thanh toán", formatDateSafe(invoice.dueDate))}
          <View className="h-[1px] bg-gray-200 my-2" />
          {renderRow(
            "Tổng tiền",
            `${formatCurrency((invoice.totalAmount || 0).toString())}đ`,
            true,
          )}
          {renderRow(
            "Đã thanh toán",
            `${formatCurrency((invoice.paidAmount || 0).toString())}đ`,
          )}
          {renderRow(
            "Còn lại",
            `${formatCurrency((invoice.remainingAmount || 0).toString())}đ`,
            true,
          )}
        </CardComponent>

        {/* Chi tiết hóa đơn */}
        <CardComponent
          title="Chi tiết hóa đơn"
          description="Các khoản mục được tính trong hóa đơn"
        >
          {invoiceItems.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="list-outline" size={22} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500">Chưa có khoản mục nào</Text>
            </View>
          ) : (
            <View className="flex flex-col">
              {invoiceItems.map((item, idx) => {
                const amount = item.totalAmount ?? item.amount ?? 0;
                return (
                  <View
                    key={item.id || `${item.type}-${idx}`}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name={
                          item.type === InvoiceItemType.ROOM_RENT
                            ? "home-outline"
                            : "construct-outline"
                        }
                        size={18}
                        color="#6B7280"
                      />
                      <View className="ml-2 flex-1">
                        <Text className="text-base font-medium text-gray-900">
                          {item.name || "Khoản mục"}
                        </Text>
                        {/* <Text className="text-xs text-gray-500">
                          {ITEM_TYPE_LABEL[item.type]}
                        </Text> */}
                      </View>
                    </View>
                    <Text className="text-sm font-semibold text-gray-900">
                      {formatCurrency(amount.toString())}đ
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </CardComponent>

        {/* Ghi chú */}
        <CardComponent title="Ghi chú">
          <Text className="text-sm text-gray-800">
            {invoice.notes || "Không có ghi chú"}
          </Text>
        </CardComponent>
      </KeyboardAwareScrollView>
      <ActionButtonBottom
        actions={[
          {
            label: "Ghi nhận thanh toán",
            icon: "card",
            variant: "success",
            isLoading: isSubmitting,
            onPress: handleOpenPaymentForm,
          },
          [
            {
              label: "Hủy",
              icon: "close-circle",
              variant: "danger",
              onPress: () => {
                navigation.goBack();
              },
            },
            {
              label: "Tạo hóa đơn",
              icon: "checkmark-circle",
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        ]}
      />
    </>
  );
};

export default CreateInvoice;
