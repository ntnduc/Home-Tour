import {
  createPayment,
  getInvoice,
  getPaymentsByInvoice,
} from "@/api/invoice/invoice.api";
import ActionButtonBottom from "@/components/ActionButtonBottom";
import DisplayField from "@/components/DisplayField";
import { useGlobalAppSheet } from "@/components/GlobalAppSheet";
import Loading from "@/components/Loading";
import { RootStackParamList } from "@/navigation/types";
import CardComponent from "@/screens/common/CardComponent";
import ServiceDetailInvoiceItemComponent from "@/screens/invoice/components/ServiceDetailInvoiceItemComponent";
import {
  INVOICE_STATUS_COLOR,
  InvoiceDetailResponse,
  InvoiceStatus,
} from "@/types/invoice";
import { InvoiceItemType } from "@/types/invoice.item";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_LABEL,
  PaymentCreateRequest,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from "@/types/payment";
import { cn, formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetFooter } from "@gorhom/bottom-sheet";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import ConfirmPaymentInvoice, {
  ConfirmPaymentInvoiceRef,
} from "./components/ConfirmPaymentInvoice";

type InvoiceDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "InvoiceDetail">;
  route: { params: RootStackParamList["InvoiceDetail"] };
};

interface PaymentFormData {
  amount: number;
  paymentDate: Date | null;
  paymentMethod: PaymentMethod;
  note?: string;
}

const InvoiceDetailScreen = ({
  navigation,
  route,
}: InvoiceDetailScreenProps) => {
  const { invoiceId } = route.params;
  const refPaymentForm = useRef<ConfirmPaymentInvoiceRef>(null);

  const [isLoading, setIsLoading] = useState(true);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceDetailResponse | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const { openAppSheet, closeAppSheet } = useGlobalAppSheet();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<InvoiceDetailResponse>({
    defaultValues: () => {
      return getInvoice(invoiceId)
        .then((response) => {
          if (response && response.data) {
            return response.data;
          }
          navigation.goBack();
          return {} as any;
        })
        .catch((error) => {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: error.response.data?.message
              ? error.response.data?.message
              : "Không tìm thấy dữ liệu",
          });
          navigation.goBack();
        });
    },
  });

  useEffect(() => {
    getInvoice(invoiceId)
      .then((response) => {
        if (response && response.data) {
          setInvoice(response.data);
          return;
        }
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không tìm thấy dữ liệu",
        });
        navigation.goBack();
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: error.response.data?.message
            ? error.response.data?.message
            : "Không tìm thấy dữ liệu",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [invoiceId]);

  const remainingAmount = invoice?.remainingAmount ?? 0;

  // Kiểm tra hóa đơn quá hạn
  const isOverdue = useMemo(() => {
    if (!invoice) return false;
    if (
      invoice.status === InvoiceStatus.PAID ||
      invoice.status === InvoiceStatus.CANCELLED
    )
      return false;
    return new Date(invoice.dueDate) < new Date();
  }, [invoice]);

  // Có thể thanh toán?
  const canMakePayment = useMemo(() => {
    if (!invoice) return false;
    return (
      invoice.status === InvoiceStatus.PENDING ||
      invoice.status === InvoiceStatus.PARTIALLY_PAID ||
      invoice.status === InvoiceStatus.OVERDUE
    );
  }, [invoice]);

  // Tỷ lệ đã thanh toán (%)
  const paidPercentage = useMemo(() => {
    if (!invoice || !invoice.totalAmount) return 0;
    return Math.round((invoice.paidAmount / invoice.totalAmount) * 100);
  }, [invoice]);

  // Map InvoiceItemDetailResponse -> shape cho ServiceDetailInvoiceItemComponent
  const mappedServiceItems = useMemo(() => {
    if (!invoice?.invoiceItems) return [];
    return invoice.invoiceItems
      .filter((item) => item.type === InvoiceItemType.SERVICE_FEE)
      .map((item) => ({
        ...item,
        isUpdated: false,
        name: item.contractService?.name ?? "Dịch vụ",
        calculationMethod: item.contractService?.calculationMethod,
      }));
  }, [invoice?.invoiceItems]);

  // Tiền thuê phòng
  const roomRentAmount = useMemo(() => {
    if (!invoice?.invoiceItems) return 0;
    const rentItem = invoice.invoiceItems.find(
      (item) => item.type === InvoiceItemType.ROOM_RENT,
    );
    return Number(rentItem?.amount ?? 0);
  }, [invoice?.invoiceItems]);

  // Tổng dịch vụ
  const totalServiceAmount = useMemo(() => {
    if (!invoice?.invoiceItems) return 0;
    return invoice.invoiceItems
      .filter((item) => item.type === InvoiceItemType.SERVICE_FEE)
      .reduce(
        (sum, item) => sum + Number(item.totalAmount ?? item.amount ?? 0),
        0,
      );
  }, [invoice?.invoiceItems]);

  const fetchInvoice = useCallback(async () => {
    try {
      const response = await getInvoice(invoiceId);
      if (response.success && response.data) {
        setInvoice(response.data);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể tải thông tin hóa đơn",
        });
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin hóa đơn",
      });
      navigation.goBack();
    }
  }, [invoiceId]);

  const fetchPayments = useCallback(async () => {
    try {
      const response = await getPaymentsByInvoice(invoiceId);
      if (response.success && response.data) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  }, [invoiceId]);

  useEffect(() => {
    reset();
  }, [invoiceId]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchInvoice(), fetchPayments()]);
    setIsRefreshing(false);
  }, [fetchInvoice, fetchPayments]);

  // --- Payment form ---
  const handleOpenPaymentForm = () => {
    if (!invoice) return;

    openAppSheet(
      <ConfirmPaymentInvoice ref={refPaymentForm} invoice={invoice} />,
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
                {
                  label: "Xác Nhận",
                  icon: "cash",
                  variant: "success",
                  isLoading: isSubmitting,
                  onPress: () => {
                    refPaymentForm.current?.submit();
                  },
                  // onPress: handleOpenPaymentForm,
                  // hidden: !canMakePayment,
                },
                {
                  label: "Hủy",
                  icon: "close-circle",
                  variant: "danger",
                  onPress: () => {
                    closeAppSheet();
                  },
                },
              ]}
            />
          </BottomSheetFooter>
        ),
      },
    );
  };

  const handleSavePayment = async (formData: any) => {
    if (!invoice) return;

    if (!formData.paymentDate) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ngày thanh toán",
      });
      return;
    }

    if (formData.amount <= 0) {
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
        reset();
        fetchInvoice();
        fetchPayments();
      } else {
        throw new Error(response.message || "Không thể ghi nhận thanh toán");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Không thể ghi nhận thanh toán",
      });
    } finally {
      closeAppSheet();
    }
  };

  // --- Helpers ---
  const getDaysOverdue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const renderRow = (
    label: string,
    value?: string | number,
    strong?: boolean,
  ) => <DisplayField label={label} value={value} strong={strong} />;

  // --- Render ---
  if (isLoading || !invoice) {
    return <Loading />;
  }

  const statusColor = INVOICE_STATUS_COLOR[invoice.status];
  const daysOverdue = getDaysOverdue(invoice.dueDate);
  const statusIcon =
    invoice.status === InvoiceStatus.PAID
      ? "checkmark-circle"
      : invoice.status === InvoiceStatus.OVERDUE || isOverdue
        ? "warning"
        : invoice.status === InvoiceStatus.CANCELLED
          ? "close-circle"
          : "time";

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cảnh báo quá hạn */}
        {(invoice.status === InvoiceStatus.OVERDUE || isOverdue) && (
          <View className="bg-red-50 rounded-xl p-3 border border-red-200 flex-row items-center">
            <Ionicons name="warning" size={20} color="#FF3B30" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-red-800">
                Hóa đơn quá hạn
              </Text>
              <Text className="text-xs text-red-600">
                Quá hạn {daysOverdue} ngày (hạn:{" "}
                {formatDate(invoice.dueDate.toString())})
              </Text>
            </View>
          </View>
        )}

        {/* 1. Header + Trạng thái */}
        <CardComponent>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1 italic">
                {invoice.code ? `#${invoice.code}` : ""}
                {/* {invoice.paymentMonth ? `tháng ${invoice.paymentMonth}` : ""} */}
              </Text>
              <Text className="text-sm text-gray-600">
                {invoice.roomName ?? ""}{" "}
                {invoice.propertyName ? `• ${invoice.propertyName}` : ""}
              </Text>
            </View>
            {/* <View
              className="px-3 py-1.5 rounded-full flex-row items-center"
              style={{ backgroundColor: statusColor.bg }}
            >
              <Ionicons name={statusIcon} size={14} color={statusColor.color} />
              <Text
                className="text-xs font-semibold ml-1"
                style={{ color: statusColor.color }}
              >
                {INVOICE_STATUS_LABEL[invoice.status]}
              </Text>
            </View> */}
          </View>
        </CardComponent>

        {/* 2. Tóm tắt thanh toán - nổi bật */}
        <CardComponent>
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            {/* Còn phải thu - nhấn mạnh */}
            <View className="flex-row items-center mb-2">
              <Ionicons name="receipt-outline" size={20} color="#1E40AF" />
              <Text className="ml-2 text-sm font-semibold text-blue-700">
                {invoice.status === InvoiceStatus.PAID
                  ? "Đã thanh toán đủ"
                  : "Còn phải thu"}
              </Text>
            </View>
            <Text
              className={`text-3xl font-extrabold text-center ${
                invoice.status === InvoiceStatus.PAID
                  ? "text-green-600"
                  : "text-blue-700"
              }`}
            >
              {formatCurrency(
                (invoice.status === InvoiceStatus.PAID
                  ? invoice.totalAmount
                  : remainingAmount
                ).toString(),
              )}
              đ
            </Text>

            {/* Thanh tiến trình */}
            {/* {invoice.totalAmount > 0 && (
              <View className="mt-3">
                <View className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <View
                    style={{
                      width: `${Math.min(paidPercentage, 100)}%`,
                      height: "100%",
                      backgroundColor:
                        invoice.status === InvoiceStatus.PAID
                          ? "#22C55E"
                          : "#2563EB",
                      borderRadius: 4,
                    }}
                  />
                </View>
                <Text className="text-xs text-blue-600 text-center mt-1">
                  Đã thu {paidPercentage}%
                </Text>
              </View>
            )} */}

            {/* Chi tiết số tiền */}
            <View className="mt-3 pt-3 border-t border-blue-200">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs text-blue-600">Tổng tiền</Text>
                <Text className="text-sm font-semibold text-blue-700">
                  {formatCurrency(invoice.totalAmount.toString())}đ
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs text-blue-600">Đã thu</Text>
                <Text className="text-sm font-semibold text-green-600">
                  {formatCurrency(invoice.paidAmount.toString())}đ
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-blue-600">Còn lại</Text>
                <Text
                  className={`text-sm font-bold ${
                    remainingAmount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(remainingAmount.toString())}đ
                </Text>
              </View>
            </View>
          </View>
        </CardComponent>

        {/* 3. Thông tin hợp đồng */}
        <CardComponent title="Thông tin hợp đồng">
          <View>
            {renderRow("Phòng", invoice.roomName || "-", true)}
            {renderRow("Người thuê", invoice.clientName || "-")}
            {renderRow("Tòa nhà", invoice.propertyName || "-")}
          </View>
        </CardComponent>

        {/* 4. Kỳ hóa đơn */}
        <CardComponent title="Thông tin thanh toán">
          <View>
            {/* {renderRow(
              "Hóa đơn tháng",
              invoice.paymentMonth ? `Tháng ${invoice.paymentMonth}` : "-",
            )} */}
            {renderRow(
              "Kỳ thanh toán",
              invoice.billingPeriodStart && invoice.billingPeriodEnd
                ? `${formatDate(invoice.billingPeriodStart.toString())} - ${formatDate(invoice.billingPeriodEnd.toString())}`
                : "-",
            )}
            <DisplayField
              label="Hạn thanh toán"
              value={
                invoice.dueDate ? formatDate(invoice.dueDate.toString()) : "-"
              }
              valueClassName={cn(
                isOverdue && invoice.status !== InvoiceStatus.PAID
                  ? "text-red-600 font-semibold"
                  : "text-gray-900",
              )}
            />
            {/* <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-gray-600">Hạn thanh toán</Text>
              <Text
                className={`text-base font-semibold ${
                  isOverdue && invoice.status !== InvoiceStatus.PAID
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {invoice.dueDate ? formatDate(invoice.dueDate.toString()) : "-"}
              </Text>
            </View> */}
            {invoice.createdAt &&
              renderRow("Ngày tạo", formatDate(invoice.createdAt))}
          </View>
        </CardComponent>

        {/* 5. Chi tiết dịch vụ */}
        <CardComponent
          title="Chi tiết dịch vụ"
          description="Các dịch vụ được tính trong hóa đơn này"
        >
          {mappedServiceItems.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="construct-outline" size={22} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500">Không có dịch vụ nào</Text>
            </View>
          ) : (
            <View className="flex flex-col">
              {mappedServiceItems.map((item, idx) => (
                <ServiceDetailInvoiceItemComponent
                  key={`${item.contractServiceId || idx + 1}`}
                  data={item}
                  isLast={idx === mappedServiceItems.length - 1}
                />
              ))}
            </View>
          )}
        </CardComponent>

        {/* 6. Tóm tắt chi phí */}
        <CardComponent title="Tóm tắt chi phí">
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-gray-600">Tiền thuê</Text>
              <Text className="text-base font-semibold text-gray-900">
                {formatCurrency(roomRentAmount.toString())}đ
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
                {formatCurrency(invoice.totalAmount.toString())}đ
              </Text>
            </View>
          </View>
        </CardComponent>

        {/* 7. Lịch sử thanh toán */}
        {payments.length > 0 && (
          <CardComponent title="Lịch sử thanh toán">
            <View>
              {payments.map((payment, index) => {
                const pmStatusColor =
                  PAYMENT_STATUS_COLOR[payment.status as PaymentStatus] ??
                  PAYMENT_STATUS_COLOR[PaymentStatus.PAID];
                return (
                  <View
                    key={payment.id || index}
                    className={`flex-row justify-between items-center py-3 ${
                      index !== payments.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#22C55E"
                        />
                        <Text className="text-sm font-medium text-gray-900 ml-2">
                          {formatDate(payment.paymentDate.toString())}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500 ml-6">
                        {payment.paymentMethod
                          ? (PAYMENT_METHOD_LABEL[
                              payment.paymentMethod as PaymentMethod
                            ] ?? payment.paymentMethod)
                          : "Tiền mặt"}
                      </Text>
                      {payment.note && (
                        <Text className="text-xs text-gray-400 ml-6 mt-0.5">
                          {payment.note}
                        </Text>
                      )}
                    </View>
                    <View className="items-end">
                      <Text className="text-base font-semibold text-green-600">
                        +{formatCurrency(payment.amount.toString())}đ
                      </Text>
                      <View
                        className="px-2 py-0.5 rounded-full mt-1"
                        style={{ backgroundColor: pmStatusColor.bg }}
                      >
                        <Text
                          className="text-[10px] font-semibold"
                          style={{ color: pmStatusColor.color }}
                        >
                          {PAYMENT_STATUS_LABEL[
                            payment.status as PaymentStatus
                          ] ?? payment.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </CardComponent>
        )}

        {/* 8. Ghi chú */}
        {invoice.notes && (
          <CardComponent title="Ghi chú">
            <View>
              <Text className="text-base text-gray-900">{invoice.notes}</Text>
            </View>
          </CardComponent>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <ActionButtonBottom
        actions={[
          {
            label: "Ghi nhận thanh toán",
            icon: "cash",
            variant: "success",
            isLoading: isSubmitting,
            onPress: handleOpenPaymentForm,
            hidden: !canMakePayment,
          },
        ]}
      />
    </>
  );
};

export default InvoiceDetailScreen;
