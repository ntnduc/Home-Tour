import Button from "@/components/Button";
import Chip from "@/components/Chip";
import DatePicker from "@/components/DatePicker";
import { uiSpace, uiType } from "@/theme";
import { ComboOptionWithExtra } from "@/types/comboOption";
import { INVOICE_STATUS_BADGE, InvoiceStatus } from "@/types/invoice";
import { PropertyDetail } from "@/types/property";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EMPTY_ADVANCED_FILTERS, InvoiceAdvancedFilters } from "../hooks/useInvoiceListData";

interface Props {
  initial: InvoiceAdvancedFilters;
  buildings: ComboOptionWithExtra<string, string, PropertyDetail>[];
  onApply: (filters: InvoiceAdvancedFilters) => void;
}

const STATUS_ORDER: InvoiceStatus[] = [
  InvoiceStatus.PENDING,
  InvoiceStatus.PARTIALLY_PAID,
  InvoiceStatus.OVERDUE,
  InvoiceStatus.PAID,
  InvoiceStatus.CANCELLED,
];

/**
 * Extra invoice filters in a bottom sheet (sheet content is a snapshot, so it keeps its own draft state).
 *
 * ```
 * TÒA NHÀ      (Tất cả)(Tòa A)(Tòa B)…      wrap chips
 * TRẠNG THÁI   (Chờ thanh toán)(Quá hạn)…   multi-select chips
 * NGÀY TẠO     [Từ ngày]  [Đến ngày]
 * [ Xóa lọc ]  [ Áp dụng ]
 * ```
 */
const InvoiceFilterSheet = ({ initial, buildings, onApply }: Props) => {
  const [draft, setDraft] = useState<InvoiceAdvancedFilters>(initial);

  const toggleStatus = (status: InvoiceStatus) =>
    setDraft((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));

  return (
    <BottomSheetScrollView contentContainerStyle={styles.content}>
      <Text style={uiType.eyebrow}>Tòa nhà</Text>
      <View style={styles.wrap}>
        <Chip
          label="Tất cả"
          variant="outline"
          selected={!draft.propertyId}
          onPress={() => setDraft((p) => ({ ...p, propertyId: null }))}
        />
        {buildings
          .filter((b) => b.value)
          .map((b) => (
            <Chip
              key={b.value}
              label={b.extra?.name ?? b.label ?? ""}
              variant="outline"
              selected={draft.propertyId === b.value}
              onPress={() => setDraft((p) => ({ ...p, propertyId: b.value }))}
            />
          ))}
      </View>

      <Text style={uiType.eyebrow}>Trạng thái hóa đơn</Text>
      <View style={styles.wrap}>
        {STATUS_ORDER.map((status) => (
          <Chip
            key={status}
            label={INVOICE_STATUS_BADGE[status].label}
            variant="outline"
            selected={draft.statuses.includes(status)}
            onPress={() => toggleStatus(status)}
          />
        ))}
      </View>

      <Text style={uiType.eyebrow}>Ngày tạo</Text>
      <DatePicker
        placeholder="Từ ngày"
        value={draft.createdFrom}
        maxDate={draft.createdTo ?? undefined}
        onChange={(date) => setDraft((p) => ({ ...p, createdFrom: date }))}
        onClear={() => setDraft((p) => ({ ...p, createdFrom: null }))}
      />
      <DatePicker
        placeholder="Đến ngày"
        value={draft.createdTo}
        minDate={draft.createdFrom ?? undefined}
        onChange={(date) => setDraft((p) => ({ ...p, createdTo: date }))}
        onClear={() => setDraft((p) => ({ ...p, createdTo: null }))}
      />

      <View style={styles.actions}>
        <Button
          label="Xóa lọc"
          variant="outline"
          block
          onPress={() => setDraft(EMPTY_ADVANCED_FILTERS)}
        />
        <Button label="Áp dụng" block onPress={() => onApply(draft)} />
      </View>
    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  content: { padding: uiSpace.screen, gap: uiSpace.gap },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actions: { flexDirection: "row", gap: uiSpace.gap, marginTop: 8 },
});

export default InvoiceFilterSheet;
