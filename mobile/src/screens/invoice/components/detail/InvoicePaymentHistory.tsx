import FormSection from "@/components/FormSection";
import IconSquircle from "@/components/IconSquircle";
import SectionError from "@/components/SectionError";
import StatusBadge from "@/components/StatusBadge";
import { tokens, uiColors, uiRadius, uiType, uiWeight } from "@/theme";
import { BasePagingResponse } from "@/types/base.response";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_BADGE,
  PaymentDetailResponse,
  PaymentMethod,
  PaymentStatus,
} from "@/types/payment";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface InvoicePaymentHistoryProps {
  payments: BasePagingResponse<PaymentDetailResponse> | never[];
  isError: boolean;
  onRetry: () => void;
}

/**
 * Payment history FormSection (hidden when empty and healthy).
 *
 * ```
 * ▣ Lịch sử thanh toán   [2]   (time-outline · success tone · count pill)
 * ─────────────────────────────
 * ▣  12/05/2026              +2.500.000đ
 *    Tiền mặt · ghi chú       ● Đã thanh toán
 * ─────────────────────────────  hairline between rows (first row paddingTop 0)
 * ```
 */
const InvoicePaymentHistory = ({
  payments,
  isError,
  onRetry,
}: InvoicePaymentHistoryProps) => {
  if (isError) {
    return (
      <SectionError
        onRetry={onRetry}
        message="Không tải được lịch sử thanh toán"
      />
    );
  }
  if (!Array.isArray(payments) && payments?.items?.length === 0) return null;

  const countBadge = !Array.isArray(payments) ? (
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{payments?.items?.length ?? 0}</Text>
    </View>
  ) : undefined;

  return (
    <FormSection
      title="Lịch sử thanh toán"
      icon="time-outline"
      iconTone="success"
      action={countBadge}
    >
      <View>
        {(payments as BasePagingResponse<PaymentDetailResponse>)?.items?.map(
          (payment, index) => {
            const badge =
              PAYMENT_STATUS_BADGE[payment.status] ??
              PAYMENT_STATUS_BADGE[PaymentStatus.PAID];
            const method = payment.paymentMethod
              ? (PAYMENT_METHOD_LABEL[payment.paymentMethod as PaymentMethod] ??
                payment.paymentMethod)
              : PAYMENT_METHOD_LABEL[PaymentMethod.CASH];
            const note = payment.notes ?? payment.note;
            return (
              <View
                key={payment.id || index}
                style={[
                  styles.row,
                  index > 0 && styles.divider,
                  index === 0 && styles.firstRow,
                ]}
              >
                <IconSquircle
                  icon="checkmark-circle"
                  tone="success"
                  size="sm"
                />
                <View style={styles.main}>
                  <Text style={uiType.bodyStrong}>
                    {formatDate(payment.paymentDate.toString())}
                  </Text>
                  <Text style={uiType.caption} numberOfLines={2}>
                    {note ? `${method} · ${note}` : method}
                  </Text>
                </View>
                <View style={styles.side}>
                  <Text
                    style={[
                      uiType.bodyStrong,
                      { color: tokens.colors.success },
                    ]}
                  >
                    +{formatCurrency(String(payment.amount))}đ
                  </Text>
                  <StatusBadge
                    label={badge.label}
                    tone={badge.tone}
                    size="sm"
                  />
                </View>
              </View>
            );
          },
        )}
      </View>
    </FormSection>
  );
};

const styles = StyleSheet.create({
  countBadge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: uiRadius.pill,
    backgroundColor: uiColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    ...uiType.caption,
    color: tokens.colors.surface,
    fontWeight: uiWeight.bold,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  firstRow: {
    paddingTop: 0,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: uiColors.hairline,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  side: {
    alignItems: "flex-end",
    gap: 4,
  },
});

export default InvoicePaymentHistory;
