import { cancelContractPreInvoice } from "@/api/contract/contract.api";
import {
  confirmInvoice,
  getInvoice,
  paymentInvoice,
  updateInvoiceItems,
} from "@/api/invoice/invoice.api";
import ActionButtonBottom from "@/components/ActionButtonBottom";
import DisplayField from "@/components/DisplayField";
import EmptyState from "@/components/EmptyState";
import FormScreen from "@/components/FormScreen";
import FormSection from "@/components/FormSection";
import { useGlobalAppSheet } from "@/components/GlobalAppSheet";
import Loading from "@/components/Loading";
import NoticeBanner from "@/components/NoticeBanner";
import ScreenHeader from "@/components/ScreenHeader";
import { useNavigator } from "@/navigation/useNavigator";
import CancelPreInvoiceReason, {
  CancelPreInvoiceReasonRef,
} from "@/screens/invoice/components/CancelPreInvoiceReason";
import ConfirmPaymentInvoice, {
  ConfirmPaymentInvoiceRef,
} from "@/screens/invoice/components/ConfirmPaymentInvoice";
import InvoiceDraftItemsSection from "@/screens/invoice/components/create/InvoiceDraftItemsSection";
import InvoiceDraftSummaryCard from "@/screens/invoice/components/create/InvoiceDraftSummaryCard";
import UpdateInvoiceItemsPrice, {
  UpdateInvoiceItemsPriceRef,
} from "@/screens/invoice/components/UpdateInvoiceItemsPrice";
import { tokens, uiColors, uiSpace, uiType } from "@/theme";
import {
  InvoiceDetailResponse,
  InvoicePaymentRequest,
  InvoiceStatus,
} from "@/types/invoice";
import { InvoiceItemDetailResponse } from "@/types/invoice.item";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import { BottomSheetFooter } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface CreateInvoiceProps {
  // navigation: NativeStackNavigationProp<RootStackParamList, "CreateContract">;
  /** Id của hóa đơn được backend tạo ra sau khi tạo hợp đồng. */
  invoiceId: string;
  /**
   * Pre-invoice of a just-created contract: while it is still a draft the user
   * can only confirm it or cancel it (with a reason) - back navigation is blocked.
   */
  isPreInvoice?: boolean;
}

const formatDateSafe = (value?: string | Date) =>
  value ? formatDate(String(value)) : "-";

/**
 * Draft invoice step shown right after a contract is created (or from the invoice list).
 * Keeps the native stack header; the pre-invoice back-lock is driven by the frozen effects.
 *
 * ```
 * FormScreen (canvas · gutter 20 · gap 12)
 * ╭ NoticeBanner success: contract created with the first invoice ╮
 * ┌ InvoiceDraftSummaryCard ───────────────────────────────────────┐
 * │ ▣ Mã hóa đơn                             ● Nháp                 │
 * │   HD-001 / Chưa cấp mã                                          │
 * │ ┌ SỐ TIỀN CẦN THANH TOÁN · tile ──────────────────────────────┐ │
 * └────────────────────────────────────────────────────────────────┘
 * ┌ FormSection ▣ Thông tin hợp đồng ──────────────────────────────┐
 * ┌ FormSection ▣ Thông tin thanh toán ────────────────────────────┐  period · due · hairline · totals
 * ┌ InvoiceDraftItemsSection ▣ Chi tiết hóa đơn  [Cập nhật giá] ───┐  DRAFT only
 * ┌ FormSection ▣ Ghi chú ─────────────────────────────────────────┐
 * ├────────────────────────────────────────────────────────────────┤
 * │ [Ghi nhận thanh toán]                                          │
 * │ [Hủy hóa đơn / Hủy]  [Xác nhận hóa đơn]                        │ ActionButtonBottom (sticky)
 * └────────────────────────────────────────────────────────────────┘
 * ```
 * Not-found state: centered EmptyState. Loading state: frozen Loading branch.
 */
const CreateInvoice = ({
  // navigation,
  invoiceId,
  isPreInvoice = false,
}: CreateInvoiceProps) => {
  const { navigation, goBack, goHome } = useNavigator();
  const [loading, setLoading] = useState<boolean>(true);
  const [invoice, setInvoice] = useState<InvoiceDetailResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittingItemsPrice, setIsSubmittingItemsPrice] =
    useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const refPaymentForm = useRef<ConfirmPaymentInvoiceRef>(null);
  const refUpdateItemsPriceForm = useRef<UpdateInvoiceItemsPriceRef>(null);
  const refCancelForm = useRef<CancelPreInvoiceReasonRef>(null);
  // Synchronous guard against double submit (state is stale inside the sheet footer)
  const isCancellingRef = useRef(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const queryClient = useQueryClient();
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

  // Lock back navigation while the pre-invoice is still an unresolved draft
  const isBackLocked =
    isPreInvoice && (!invoice || invoice.status === InvoiceStatus.DRAFT);

  useEffect(() => {
    if (!isPreInvoice) return;
    navigation.setOptions({
      gestureEnabled: !isBackLocked,
      headerBackVisible: !isBackLocked,
    });
    if (!isBackLocked) return;

    const removeListener = navigation.addListener("beforeRemove", (event) => {
      event.preventDefault();
    });
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => {
      removeListener();
      backHandler.remove();
    };
  }, [isPreInvoice, isBackLocked, navigation]);

  const handleCancelPreInvoice = async (reason: string) => {
    if (!invoice || isCancellingRef.current) return;
    isCancellingRef.current = true;
    setIsCancelling(true);
    try {
      const response = await cancelContractPreInvoice(
        invoice.contractId,
        reason,
      );
      if (!response.success) {
        throw new Error(response.message || "Không thể hủy hóa đơn");
      }
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã hủy hóa đơn đầu tiên",
      });
      closeAppSheet();
      // Contract is settled: unlock, then leave this step
      setInvoice({ ...invoice, status: InvoiceStatus.CANCELLED });
      requestAnimationFrame(goBack);
    } catch (error: any) {
      console.log("💞💓💗💞💓💗 ~ handleCancelPreInvoice ~ error:", error);
      // Backend rolled back: invoice stays DRAFT, the sheet stays open for a retry
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2:
          error?.response?.data?.message ??
          error?.message ??
          "Không thể hủy hóa đơn",
      });
    } finally {
      isCancellingRef.current = false;
      setIsCancelling(false);
    }
  };

  const handleOpenCancelPreInvoice = () => {
    if (!invoice) return;

    openAppSheet(
      <CancelPreInvoiceReason
        ref={refCancelForm}
        onSubmit={handleCancelPreInvoice}
      />,
      {
        snapPoints: ["50%"],
        detached: false,
        header: {
          title: "Hủy hóa đơn đầu tiên",
          onClose: () => {
            closeAppSheet();
          },
        },
        renderFooter: (props) => (
          <BottomSheetFooter {...props}>
            <ActionButtonBottom
              actions={[
                {
                  label: "Xác nhận hủy",
                  icon: "close-circle",
                  variant: "danger",
                  isLoading: isCancelling,
                  onPress: () => {
                    refCancelForm.current?.submit();
                  },
                },
              ]}
            />
          </BottomSheetFooter>
        ),
      },
    );
  };

  const handleSavePayment = async (formData: InvoicePaymentRequest) => {
    if (!invoice) return;
    setIsSubmitting(true);
    if (invoice.status === InvoiceStatus.DRAFT) {
      try {
        const responseConfirm = await confirmInvoice(invoiceId);
        if (!responseConfirm.success || !responseConfirm.data) {
          throw new Error(
            responseConfirm.message || "Không thể xác nhận hóa đơn",
          );
        }
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2:
            error?.response?.data?.message ??
            error?.message ??
            "Không thể xác nhận hóa đơn",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const paymentData: InvoicePaymentRequest = {
        id: formData.id,
        paidAmount: formData.paidAmount,
        paymentMethod: formData.paymentMethod ?? "CASH",
        isCarryOver: formData.isCarryOver ?? false,
        notes: formData.notes,
        remainingAmount: formData.remainingAmount,
      };

      const response = await paymentInvoice(paymentData);
      if (response.success && response.data) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã ghi nhận thanh toán thành công",
        });
        closeAppSheet();
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
        queryClient.invalidateQueries({ queryKey: ["homepage"] });
        await fetchInvoice();
      } else {
        throw new Error(response.message || "Không thể ghi nhận thanh toán");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.data?.message || "Không thể ghi nhận thanh toán",
      });
      return;
    } finally {
      setIsSubmitting(false);
      // closeAppSheet();
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

  const handleSaveInvoiceItemsPrice = async (
    updatedItems: InvoiceItemDetailResponse[],
  ) => {
    if (!invoice) return;
    setIsSubmittingItemsPrice(true);

    try {
      const response = await updateInvoiceItems({
        id: invoiceId,
        invoiceItems: updatedItems.map((item) => ({
          id: item.id,
          amount: item.totalAmount ?? item.amount ?? 0,
        })),
      });

      if (response.success && response.data) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã cập nhật giá các khoản mục",
        });
        closeAppSheet();
        await fetchInvoice();
      } else {
        throw new Error(response.message || "Không thể cập nhật giá khoản mục");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2:
          error?.response?.data?.message ?? "Không thể cập nhật giá khoản mục",
      });
    } finally {
      setIsSubmittingItemsPrice(false);
    }
  };

  const handleOpenUpdateItemsPrice = () => {
    if (!invoice) return;

    openAppSheet(
      <UpdateInvoiceItemsPrice
        ref={refUpdateItemsPriceForm}
        invoice={invoice}
        onSubmit={handleSaveInvoiceItemsPrice}
      />,
      {
        snapPoints: ["80%"],
        detached: false,
        header: {
          title: "Cập nhật giá khoản mục",
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
                    label: "Lưu",
                    icon: "save",
                    variant: "success",
                    isLoading: isSubmittingItemsPrice,
                    onPress: () => {
                      refUpdateItemsPriceForm.current?.submit();
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

  const handleConfirmInvoice = () => {
    if (!invoice) return;

    Alert.alert(
      "Xác nhận hóa đơn",
      "Sau khi xác nhận, hóa đơn sẽ được phát hành và không thể chỉnh sửa giá khoản mục.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            setIsConfirming(true);
            try {
              const response = await confirmInvoice(invoiceId);
              if (response.success && response.data) {
                Toast.show({
                  type: "success",
                  text1: "Thành công",
                  text2: "Đã xác nhận hóa đơn",
                });
                queryClient.invalidateQueries({ queryKey: ["rooms"] });
                queryClient.invalidateQueries({ queryKey: ["homepage"] });
                // Unlock the pre-invoice back-lock, then reset to the room list
                setInvoice({ ...invoice, status: InvoiceStatus.PENDING });
                requestAnimationFrame(goHome);
              } else {
                throw new Error(
                  response.message || "Không thể xác nhận hóa đơn",
                );
              }
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Lỗi",
                text2:
                  error?.response?.data?.message ??
                  "Không thể xác nhận hóa đơn",
              });
            } finally {
              setIsConfirming(false);
            }
          },
        },
      ],
    );
  };

  // Custom header (native header hidden); back is hidden while the pre-invoice is locked
  const header = (
    <ScreenHeader
      title="Xác nhận hóa đơn nháp"
      onBack={isBackLocked ? undefined : goBack}
      insetTop
    />
  );

  if (loading) {
    return (
      <SafeAreaView edges={[]} style={styles.screen}>
        {header}
        <Loading />
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView edges={[]} style={styles.screen}>
        {header}
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="receipt-outline"
            title="Không tìm thấy hóa đơn"
            description="Hóa đơn của hợp đồng chưa được tạo hoặc đã xảy ra lỗi khi tải dữ liệu."
          />
        </View>
      </SafeAreaView>
    );
  }

  const status = invoice.status ?? InvoiceStatus.DRAFT;
  const invoiceItems = (invoice.invoiceItems ??
    []) as InvoiceItemDetailResponse[];

  // Display-only value derived from the fields above
  const remainingText = `${formatCurrency((Number(invoice.remainingAmount) || 0).toString())}đ`;

  return (
    <SafeAreaView edges={[]} style={styles.screen}>
      {header}
      <FormScreen
        footer={
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
                isPreInvoice
                  ? {
                      label: "Hủy hóa đơn",
                      icon: "close-circle",
                      variant: "danger",
                      isLoading: isCancelling,
                      hidden: status !== InvoiceStatus.DRAFT,
                      onPress: handleOpenCancelPreInvoice,
                    }
                  : {
                      label: "Hủy",
                      icon: "close-circle",
                      variant: "danger",
                      onPress: goBack,
                    },
                {
                  label: "Xác nhận hóa đơn",
                  icon: "checkmark-circle",
                  isLoading: isConfirming,
                  hidden: status !== InvoiceStatus.DRAFT,
                  onPress: handleConfirmInvoice,
                },
              ],
            ]}
          />
        }
      >
        <NoticeBanner
          tone="success"
          icon="checkmark-circle"
          message="Hợp đồng đã được tạo cùng hóa đơn đầu tiên. Kiểm tra lại thông tin bên dưới."
        />

        <InvoiceDraftSummaryCard
          code={invoice.code}
          status={status}
          remainingText={remainingText}
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
          {invoice.propertyName ? (
            <DisplayField
              label="Tòa nhà"
              value={invoice.propertyName}
              compact
            />
          ) : null}
        </FormSection>

        <FormSection title="Thông tin thanh toán" icon="calendar-outline">
          <DisplayField
            label="Kỳ thanh toán"
            value={`${formatDateSafe(invoice.billingPeriodStart)} - ${formatDateSafe(
              invoice.billingPeriodEnd,
            )}`}
            compact
          />
          <DisplayField
            label="Hạn thanh toán"
            value={formatDateSafe(invoice.dueDate)}
            compact
          />
          <View style={styles.divider} />
          <DisplayField
            label="Tổng tiền"
            value={`${formatCurrency((invoice.totalAmount || 0).toString())}đ`}
            strong
            compact
          />
          <DisplayField
            label="Đã thanh toán"
            value={`${formatCurrency((invoice.paidAmount || 0).toString())}đ`}
            valueStyle={styles.successValue}
            compact
          />
          <DisplayField
            label="Còn lại"
            value={`${formatCurrency((invoice.remainingAmount || 0).toString())}đ`}
            strong
            compact
          />
        </FormSection>

        <InvoiceDraftItemsSection
          items={invoiceItems}
          canEditPrice={status === InvoiceStatus.DRAFT}
          onEditPrice={handleOpenUpdateItemsPrice}
        />

        <FormSection title="Ghi chú" icon="document-text-outline">
          <Text style={uiType.body}>{invoice.notes || "Không có ghi chú"}</Text>
        </FormSection>
      </FormScreen>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.canvas,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    padding: uiSpace.screen,
    backgroundColor: uiColors.canvas,
  },
  divider: {
    height: 1,
    backgroundColor: uiColors.hairline,
  },
  successValue: {
    color: tokens.colors.success,
  },
});

export default CreateInvoice;
