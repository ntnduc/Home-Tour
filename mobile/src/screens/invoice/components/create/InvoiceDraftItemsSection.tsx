import Button from "@/components/Button";
import FormSection from "@/components/FormSection";
import IconSquircle, { IconTone } from "@/components/IconSquircle";
import { uiColors, uiType } from "@/theme";
import {
  InvoiceItemDetailResponse,
  InvoiceItemType,
} from "@/types/invoice.item";
import { formatCurrency } from "@/utils/appUtil";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface InvoiceDraftItemsSectionProps {
  items: InvoiceItemDetailResponse[];
  /** Parent passes `status === InvoiceStatus.DRAFT` (price edit is allowed only while the invoice is a draft). */
  canEditPrice: boolean;
  /** Parent passes the frozen `handleOpenUpdateItemsPrice`. */
  onEditPrice: () => void;
}

/**
 * Line items of the draft invoice, with the price-edit action for DRAFT invoices.
 *
 * ```
 * ▣ Chi tiết hóa đơn                    [✎ Cập nhật giá]   (list-outline · soft sm · DRAFT only)
 *   Các khoản mục được tính trong hóa đơn
 * ─────────────────────────────────────────────────────────
 * ▣ Tiền phòng                                3.000.000đ   IconSquircle sm · bodyStrong
 * ─────────────────────────────────────────────────────────  hairline between rows
 * ▣ Điện                                        500.000đ
 * (or caption "Chưa có khoản mục nào" when empty)
 * ```
 * Room rent uses the primary tone, other items the neutral tone.
 */
const InvoiceDraftItemsSection = ({
  items,
  canEditPrice,
  onEditPrice,
}: InvoiceDraftItemsSectionProps) => {
  const action = canEditPrice ? (
    <Button
      label="Cập nhật giá"
      icon="create-outline"
      variant="soft"
      size="sm"
      accessibilityLabel="Cập nhật giá"
      onPress={onEditPrice}
    />
  ) : undefined;

  return (
    <FormSection
      title="Chi tiết hóa đơn"
      icon="list-outline"
      caption="Các khoản mục được tính trong hóa đơn"
      action={action}
    >
      {items.length === 0 ? (
        <Text style={uiType.caption}>Chưa có khoản mục nào</Text>
      ) : (
        <View>
          {items.map((item, idx) => {
            const amount = item.totalAmount ?? item.amount ?? 0;
            const isRoomRent = item.type === InvoiceItemType.ROOM_RENT;
            const tone: IconTone = isRoomRent ? "primary" : "neutral";
            const isFirst = idx === 0;
            const isLast = idx === items.length - 1;
            return (
              <View
                key={item.id || `${item.type}-${idx}`}
                style={[
                  styles.row,
                  idx > 0 && styles.rowDivided,
                  isFirst && styles.rowFirst,
                  isLast && styles.rowLast,
                ]}
              >
                <IconSquircle
                  icon={isRoomRent ? "home-outline" : "construct-outline"}
                  tone={tone}
                  size="sm"
                />
                <Text
                  style={[uiType.bodyStrong, styles.name]}
                  numberOfLines={1}
                >
                  {item.name || "Khoản mục"}
                </Text>
                <Text style={uiType.bodyStrong}>
                  {`${formatCurrency(amount.toString())}đ`}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </FormSection>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: uiColors.hairline,
  },
  rowFirst: {
    paddingTop: 0,
  },
  rowLast: {
    paddingBottom: 0,
  },
  name: {
    flex: 1,
  },
});

export default InvoiceDraftItemsSection;
