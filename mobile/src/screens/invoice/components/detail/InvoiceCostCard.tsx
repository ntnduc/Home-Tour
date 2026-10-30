import FormSection from "@/components/FormSection";
import ServiceDetailInvoiceItemComponent from "@/screens/invoice/components/ServiceDetailInvoiceItemComponent";
import { tokens, uiColors, uiType } from "@/theme";
import { InvoiceDetailResponse } from "@/types/invoice";
import { InvoiceItemType } from "@/types/invoice.item";
import { formatCurrency } from "@/utils/appUtil";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface InvoiceCostCardProps {
  invoice: InvoiceDetailResponse;
}

const money = (value: number) => `${formatCurrency(String(value))}đ`;

/**
 * Service line items + cost summary (rent / services / total).
 *
 * ```
 * ▣ Chi tiết dịch vụ            (flash-outline · caption)
 * Các dịch vụ được tính trong hóa đơn này
 * ─────────────────────────────
 * item rows, or one caption line when none
 *
 * ▣ Tóm tắt chi phí            (calculator-outline)
 * ─────────────────────────────
 * Tiền thuê                 3.000.000đ
 * Dịch vụ                   2.000.000đ
 * ─────────────────────────────  hairline
 * Tổng cộng                 5.000.000đ  primary section type
 * ```
 */
const InvoiceCostCard = ({ invoice }: InvoiceCostCardProps) => {
  const items = invoice.invoiceItems;

  const serviceItems = useMemo(
    () =>
      (items ?? [])
        .filter((item) => item.type === InvoiceItemType.SERVICE_FEE)
        .map((item) => ({
          ...item,
          isUpdated: false,
          name: item.contractService?.name ?? "Dịch vụ",
          calculationMethod: item.contractService?.calculationMethod,
        })),
    [items],
  );

  const roomRent = useMemo(() => {
    const rentItem = (items ?? []).find(
      (item) => item.type === InvoiceItemType.ROOM_RENT,
    );
    return Number(rentItem?.amount ?? 0);
  }, [items]);

  const serviceTotal = useMemo(
    () =>
      serviceItems.reduce(
        (sum, item) => sum + Number(item.totalAmount ?? item.amount ?? 0),
        0,
      ),
    [serviceItems],
  );

  return (
    <>
      <FormSection
        title="Chi tiết dịch vụ"
        icon="flash-outline"
        caption="Các dịch vụ được tính trong hóa đơn này"
      >
        {serviceItems.length === 0 ? (
          <Text style={uiType.caption}>
            Không có dịch vụ nào trong hóa đơn này.
          </Text>
        ) : (
          <View>
            {serviceItems.map((item, idx) => (
              <ServiceDetailInvoiceItemComponent
                key={`${item.contractServiceId || idx + 1}`}
                data={item}
                isLast={idx === serviceItems.length - 1}
              />
            ))}
          </View>
        )}
      </FormSection>

      <FormSection title="Tóm tắt chi phí" icon="calculator-outline">
        <View style={styles.row}>
          <Text style={uiType.body}>Tiền thuê</Text>
          <Text style={uiType.bodyStrong}>{money(roomRent)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={uiType.body}>Dịch vụ</Text>
          <Text style={uiType.bodyStrong}>{money(serviceTotal)}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={uiType.bodyStrong}>Tổng cộng</Text>
          <Text style={[uiType.section, styles.total]}>
            {money(Number(invoice.totalAmount ?? 0))}
          </Text>
        </View>
      </FormSection>
    </>
  );
};

const styles = StyleSheet.create({
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

export default InvoiceCostCard;
