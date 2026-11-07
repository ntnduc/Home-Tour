import Button from "@/components/Button";
import PressableScale from "@/components/PressableScale";
import StatusBadge from "@/components/StatusBadge";
import { uiColors, uiRadius, uiSpace, uiType, uiWeight } from "@/theme";
import { BlockingInvoice } from "@/types/contract";
import { INVOICE_STATUS_BADGE, InvoiceStatus } from "@/types/invoice";
import { formatDate } from "@/utils/dateUtil";
import React from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";

interface UnpaidInvoicesModalProps {
  visible: boolean;
  invoices: BlockingInvoice[];
  onOpenInvoice: (invoice: BlockingInvoice) => void;
  onCancel: () => void;
}

/** Blocks contract deactivation: lists invoices still waiting for payment. */
const UnpaidInvoicesModal = ({
  visible,
  invoices,
  onOpenInvoice,
  onCancel,
}: UnpaidInvoicesModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={uiType.title}>Còn hóa đơn chưa thanh toán</Text>
        <Text style={styles.message}>
          Vui lòng thanh toán hoặc hủy các hóa đơn dưới đây trước khi kết thúc hợp đồng.
        </Text>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {invoices.map((invoice) => {
            const badge = INVOICE_STATUS_BADGE[invoice.status as InvoiceStatus];
            return (
              <PressableScale
                key={invoice.id}
                style={styles.row}
                onPress={() => onOpenInvoice(invoice)}
                accessibilityLabel={`Mở hóa đơn ${invoice.code ?? ""}`}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.code} numberOfLines={1}>
                    {invoice.code || "Hóa đơn"}
                  </Text>
                  <StatusBadge
                    size="sm"
                    label={badge?.label ?? invoice.status}
                    tone={badge?.tone}
                  />
                </View>
                <Text style={styles.due}>Hạn thanh toán: {formatDate(invoice.dueDate)}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        <View style={styles.actions}>
          <Button label="Hủy" variant="outline" block onPress={onCancel} />
          <Button
            label="Mở hóa đơn"
            icon="receipt-outline"
            block
            onPress={() => onOpenInvoice(invoices[0])}
            disabled={invoices.length === 0}
          />
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: uiSpace.screen,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    maxHeight: "80%",
    gap: 12,
    padding: 20,
    borderRadius: uiRadius.card,
    backgroundColor: uiColors.card,
  },
  message: { ...uiType.body, color: uiColors.textMuted },
  list: { flexGrow: 0 },
  listContent: { gap: 8 },
  row: {
    gap: 6,
    padding: 14,
    borderRadius: uiRadius.field,
    borderWidth: 1,
    borderColor: uiColors.hairline,
    backgroundColor: uiColors.canvas,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  code: { flex: 1, fontSize: 15, fontWeight: uiWeight.semibold, color: uiColors.ink },
  due: { fontSize: 13, color: uiColors.textMuted },
  actions: { flexDirection: "row", gap: 12, marginTop: 4 },
});

export default UnpaidInvoicesModal;
