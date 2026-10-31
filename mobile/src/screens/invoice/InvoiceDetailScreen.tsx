import ActionButtonBottom from "@/components/ActionButtonBottom";
import FormScreen from "@/components/FormScreen";
import FormSection from "@/components/FormSection";
import { useGlobalAppSheet } from "@/components/GlobalAppSheet";
import IconButton from "@/components/IconButton";
import Loading from "@/components/Loading";
import NoticeBanner from "@/components/NoticeBanner";
import ScreenHeader from "@/components/ScreenHeader";
import SectionError from "@/components/SectionError";
import { RootStackParamList } from "@/navigation/types";
import { tokens, uiColors, uiSpace, uiType } from "@/theme";
import { InvoicePaymentRequest } from "@/types/invoice";
import { formatDate } from "@/utils/dateUtil";
import { BottomSheetFooter } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useRef } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CancelPreInvoiceReason, {
  CancelPreInvoiceReasonRef,
} from "./components/CancelPreInvoiceReason";
import ConfirmPaymentInvoice, {
  ConfirmPaymentInvoiceRef,
} from "./components/ConfirmPaymentInvoice";
import InvoiceCostCard from "./components/detail/InvoiceCostCard";
import InvoiceInfoCard from "./components/detail/InvoiceInfoCard";
import InvoicePaymentHistory from "./components/detail/InvoicePaymentHistory";
import InvoiceSummaryCard from "./components/detail/InvoiceSummaryCard";
import {
  getInvoiceErrorMessage,
  useInvoiceDetailData,
} from "./hooks/useInvoiceDetailData";
import {
  getDaysOverdue,
  getInvoiceActionRules,
  isInvoiceLate,
} from "./invoiceDetailRules";

type InvoiceDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "InvoiceDetail">;
  route: { params: RootStackParamList["InvoiceDetail"] };
};

/**
 * Invoice detail — Modern Minimalist, UpdateRoom base layout.
 *
 * ```
 * ░ orbs ░  ‹  Chi tiết hóa đơn        (🕘)   ScreenHeader (history hidden when fromHistory)
 * ├─────────────────────────────────────────┤
 * │ FormScreen (scroll · RefreshControl)    │ gutter 20 · gap 12
 * │ ┌ ⚠ Hóa đơn quá hạn ──────────────────┐ │ NoticeBanner (late only)
 * │ ┌ Summary: code · place · status ─────┐ │ amount tile + breakdown
 * │ ┌ FormSection Thông tin hợp đồng ─────┐ │ InvoiceInfoCard (part 1)
 * │ ┌ FormSection Thông tin thanh toán ───┐ │ InvoiceInfoCard (part 2)
 * │ ┌ FormSection Chi tiết dịch vụ ───────┐ │ InvoiceCostCard (part 1)
 * │ ┌ FormSection Tóm tắt chi phí ────────┐ │ InvoiceCostCard (part 2)
 * │ ┌ FormSection Lịch sử thanh toán ─────┐ │ hidden when empty
 * │ ┌ FormSection Ghi chú ────────────────┐ │ only when notes
 * ├─────────────────────────────────────────┤
 * │ [ Hủy hóa đơn ]  [ Ghi nhận thanh toán ]│ sticky footer by status
 * └─────────────────────────────────────────┘
 * Actions: pay on PENDING / PARTIALLY_PAID / OVERDUE · cancel on DRAFT / PENDING · none otherwise.
 */

const InvoiceDetailScreen = ({
  navigation,
  route,
}: InvoiceDetailScreenProps) => {
  const { invoiceId, confirmContractId, fromHistory } = route.params;
  const { openAppSheet, closeAppSheet } = useGlobalAppSheet();

  const refPaymentForm = useRef<ConfirmPaymentInvoiceRef>(null);
  const refCancelForm = useRef<CancelPreInvoiceReasonRef>(null);
  // Synchronous guards against double submit (sheet footers capture stale state)
  const isPayingRef = useRef(false);
  const isCancellingRef = useRef(false);

  const {
    invoice,
    payments,
    isLoading,
    isRefreshing,
    isInvoiceError,
    isPaymentsError,
    refetchInvoice,
    refetchPayments,
    refreshAll,
    pay,
    isPaying,
    cancel,
    isCancelling,
  } = useInvoiceDetailData(invoiceId, confirmContractId);

  // Refetch on focus, skipping the first focus (the hook already fetched)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetchInvoice();
      refetchPayments();
    }, [refetchInvoice, refetchPayments]),
  );

  const handlePay = async (data: InvoicePaymentRequest) => {
    if (isPayingRef.current) return;
    isPayingRef.current = true;
    try {
      await pay(data);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã ghi nhận thanh toán thành công",
      });
      closeAppSheet();
      if (confirmContractId) navigation.goBack();
    } catch (error) {
      // Sheet stays open so the user can retry
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: getInvoiceErrorMessage(error, "Không thể ghi nhận thanh toán"),
      });
    } finally {
      isPayingRef.current = false;
    }
  };

  const handleCancel = async (reason: string) => {
    if (isCancellingRef.current) return;
    isCancellingRef.current = true;
    try {
      await cancel(reason);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã hủy hóa đơn",
      });
      closeAppSheet();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: getInvoiceErrorMessage(error, "Không thể hủy hóa đơn"),
      });
    } finally {
      isCancellingRef.current = false;
    }
  };

  const handleOpenPaymentForm = () => {
    if (!invoice) return;

    openAppSheet(
      <ConfirmPaymentInvoice
        ref={refPaymentForm}
        invoice={invoice}
        onSubmit={handlePay}
      />,
      {
        snapPoints: ["80%"],
        detached: false,
        header: { title: "Ghi nhận thanh toán", onClose: closeAppSheet },
        renderFooter: (props) => (
          <BottomSheetFooter {...props}>
            <ActionButtonBottom
              actions={[
                [
                  {
                    label: "Hủy",
                    icon: "close-circle",
                    variant: "outline",
                    onPress: closeAppSheet,
                  },
                  {
                    label: "Xác nhận",
                    icon: "cash",
                    variant: "success",
                    onPress: () => refPaymentForm.current?.submit(),
                  },
                ],
              ]}
            />
          </BottomSheetFooter>
        ),
      },
    );
  };

  // First invoice of a contract: warn that paying also moves the contract on
  // const handleStartPayment = () => {
  //   if (!confirmContractId) {
  //     handleOpenPaymentForm();
  //     return;
  //   }
  //   Alert.alert("Xác nhận thanh toán", CONTRACT_PAYMENT_ALERT, [
  //     { text: "Hủy", style: "cancel" },
  //     { text: "Tiếp tục", onPress: handleOpenPaymentForm },
  //   ]);
  // };

  const handleOpenCancelForm = () => {
    openAppSheet(
      <CancelPreInvoiceReason ref={refCancelForm} onSubmit={handleCancel} />,
      {
        snapPoints: ["50%"],
        detached: false,
        header: { title: "Hủy hóa đơn", onClose: closeAppSheet },
        renderFooter: (props) => (
          <BottomSheetFooter {...props}>
            <ActionButtonBottom
              actions={[
                {
                  label: "Xác nhận hủy",
                  icon: "close-circle",
                  variant: "danger",
                  onPress: () => refCancelForm.current?.submit(),
                },
              ]}
            />
          </BottomSheetFooter>
        ),
      },
    );
  };

  // Shared header: back + title + history shortcut (hidden when opened from history)
  const header = (
    <ScreenHeader
      title="Chi tiết hóa đơn"
      onBack={() => navigation.goBack()}
      insetTop
      action={
        !fromHistory ? (
          <IconButton
            icon="time-outline"
            accessibilityLabel="Lịch sử hóa đơn"
            onPress={() => navigation.navigate("InvoiceHistory")}
          />
        ) : undefined
      }
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={[]} style={styles.screen}>
        {header}
        <Loading />
      </SafeAreaView>
    );
  }

  if (isInvoiceError || !invoice) {
    return (
      <SafeAreaView edges={[]} style={styles.screen}>
        {header}
        <View style={styles.errorWrap}>
          <SectionError
            onRetry={() => refetchInvoice()}
            message="Không tải được hóa đơn"
          />
        </View>
      </SafeAreaView>
    );
  }

  const { canPay, canCancel } = getInvoiceActionRules(invoice.status);
  const isLate = isInvoiceLate(invoice.status, invoice.dueDate);

  const footer = (
    <ActionButtonBottom
      actions={[
        [
          {
            label: "Hủy hóa đơn",
            icon: "close-circle",
            variant: "outline",
            isLoading: isCancelling,
            disabled: isPaying,
            onPress: handleOpenCancelForm,
            hidden: !canCancel,
          },
          {
            label: "Ghi nhận thanh toán",
            icon: "cash",
            variant: "success",
            isLoading: isPaying,
            disabled: isCancelling,
            onPress: handleOpenPaymentForm,
            hidden: !canPay,
          },
        ],
      ]}
    />
  );

  return (
    <SafeAreaView edges={[]} style={styles.screen}>
      {header}
      <FormScreen
        footer={footer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshAll}
            tintColor={tokens.colors.primary}
            colors={[tokens.colors.primary]}
          />
        }
      >
        {isLate && (
          <NoticeBanner
            tone="error"
            icon="warning"
            title="Hóa đơn quá hạn"
            message={`Quá hạn ${getDaysOverdue(invoice.dueDate)} ngày (hạn: ${formatDate(invoice.dueDate.toString())})`}
          />
        )}

        <InvoiceSummaryCard invoice={invoice} isLate={isLate} />
        <InvoiceInfoCard invoice={invoice} isLate={isLate} />
        <InvoiceCostCard invoice={invoice} />
        <InvoicePaymentHistory
          payments={payments}
          isError={isPaymentsError}
          onRetry={() => refetchPayments()}
        />

        {invoice.notes ? (
          <FormSection title="Ghi chú" icon="document-text-outline">
            <Text style={uiType.body}>{invoice.notes}</Text>
          </FormSection>
        ) : null}
      </FormScreen>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.canvas,
  },
  errorWrap: {
    flex: 1,
    justifyContent: "center",
    padding: uiSpace.screen,
    backgroundColor: uiColors.canvas,
  },
});

export default InvoiceDetailScreen;
