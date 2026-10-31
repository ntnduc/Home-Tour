import Button from "@/components/Button";
import Card from "@/components/Card";
import IconSquircle from "@/components/IconSquircle";
import { tokens, uiColors, uiRadius, uiSpace, uiType } from "@/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ConfirmCreateSummaryCardProps {
  /** Pre-formatted, e.g. "5.000.000đ" (built in the screen from calculatedInvoiceData.totalAmount). */
  totalText: string;
  /** Pre-formatted room rent, e.g. "3.000.000đ". */
  roomRentText: string;
  /** Pre-formatted service total, e.g. "2.000.000đ". */
  serviceText: string;
  /** The screen's existing onEdit (navigation.goBack). */
  onEdit: () => void;
}

/**
 * Summary of the manually built invoice before confirmation:
 * identity row with the edit action, the amount-to-collect tile and the rent / service breakdown.
 *
 * ```
 * ┌─────────────────────────────────────────────────┐ Card soft · radius 24 · p16 · gap 16
 * │ ▣  Xác nhận tạo hóa đơn       [✎ Chỉnh sửa]      │ IconSquircle md (info) · section · Button sm outline
 * │    Kiểm tra kỹ các thông tin trước khi xác nhận │ caption (max 2 lines)
 * │ ┌─────────────────────────────────────────────┐ │
 * │ │ TỔNG TIỀN CẦN THU                           │ │ tile canvas · radius 20
 * │ │ 5.000.000đ                                  │ │ display · info
 * │ └─────────────────────────────────────────────┘ │
 * │ Tiền thuê                           3.000.000đ │ body / bodyStrong · gap 8
 * │ Dịch vụ                             2.000.000đ │
 * └─────────────────────────────────────────────────┘
 * ```
 */
const ConfirmCreateSummaryCard = ({
  totalText,
  roomRentText,
  serviceText,
  onEdit,
}: ConfirmCreateSummaryCardProps) => (
  <Card style={styles.card}>
    <View style={styles.header}>
      <IconSquircle icon="receipt-outline" tone="info" size="md" />
      <View style={styles.headerText}>
        <Text style={[uiType.section, styles.title]} numberOfLines={1}>
          Xác nhận tạo hóa đơn
        </Text>
        <Text style={uiType.caption} numberOfLines={2}>
          Kiểm tra kỹ các thông tin trước khi xác nhận
        </Text>
      </View>
      <Button
        label="Chỉnh sửa"
        icon="create-outline"
        variant="outline"
        size="sm"
        onPress={onEdit}
      />
    </View>

    <View style={styles.tile}>
      <Text style={uiType.eyebrow}>Tổng tiền cần thu</Text>
      <Text
        style={[uiType.display, { color: tokens.colors.info }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {totalText}
      </Text>
    </View>

    <View style={styles.breakdown}>
      <View style={styles.row}>
        <Text style={uiType.body}>Tiền thuê</Text>
        <Text style={uiType.bodyStrong}>{roomRentText}</Text>
      </View>
      <View style={styles.row}>
        <Text style={uiType.body}>Dịch vụ</Text>
        <Text style={uiType.bodyStrong}>{serviceText}</Text>
      </View>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    lineHeight: 24,
  },
  tile: {
    backgroundColor: uiColors.canvas,
    borderRadius: uiRadius.tile,
    padding: uiSpace.card,
    gap: 4,
  },
  breakdown: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default ConfirmCreateSummaryCard;
