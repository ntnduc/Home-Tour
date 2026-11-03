import { getListContract } from "@/api/contract/contract.api";
import { getListRoom } from "@/api/room/room.api";
import ListRow from "@/components/ListRow";
import SearchField from "@/components/SearchField";
import SectionError from "@/components/SectionError";
import { uiSpace } from "@/theme";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { uiType } from "@/theme";
import { InvoiceQuickOption } from "../hooks/useInvoiceListData";

const PICKER_LIMIT = 50;

interface Props {
  kind: "contract" | "room";
  selectedId?: string;
  /** Contract picker: narrow to the selected room. */
  roomId?: string;
  /** Narrow to the building chosen in the filter sheet. */
  propertyId?: string;
  onSelect: (option: InvoiceQuickOption | null) => void;
}

/**
 * Bottom-sheet picker for the Contract / Room quick filters.
 * Loads the first 50 records from the existing list APIs and filters the typed text locally
 * (the contract list API has no text search).
 */
const InvoiceEntityPickerSheet = ({ kind, selectedId, roomId, propertyId, onSelect }: Props) => {
  const [text, setText] = useState("");
  const isContract = kind === "contract";
  const allLabel = isContract ? "Tất cả hợp đồng" : "Tất cả phòng";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["invoice-picker", kind, roomId, propertyId],
    queryFn: async (): Promise<InvoiceQuickOption[]> => {
      const filters = { roomId, propertyId };
      if (isContract) {
        const res = await getListContract({ limit: PICKER_LIMIT, offset: 0, filters });
        return (res.data?.items ?? []).map((item) => ({
          id: item.id,
          roomId: item.roomId,
          label: [item.code, item.roomName].filter(Boolean).join(" · "),
        }));
      }
      const res = await getListRoom({ limit: PICKER_LIMIT, offset: 0, filters: { propertyId } });
      return (res.data?.items ?? []).map((item) => ({ id: item.id, label: item.name }));
    },
  });

  const options = useMemo(() => {
    const keyword = text.trim().toLowerCase();
    return (data ?? []).filter((o) => !keyword || o.label.toLowerCase().includes(keyword));
  }, [data, text]);

  return (
    <BottomSheetScrollView keyboardShouldPersistTaps="handled">
      <View style={styles.search}>
        <SearchField
          placeholder={isContract ? "Tìm hợp đồng…" : "Tìm phòng…"}
          onSearch={setText}
        />
      </View>
      <ListRow
        title={allLabel}
        icon="apps-outline"
        trailing="check"
        selected={!selectedId}
        onPress={() => onSelect(null)}
      />
      {isLoading ? (
        <ActivityIndicator style={styles.state} />
      ) : isError ? (
        <SectionError message="Không tải được danh sách" onRetry={refetch} />
      ) : options.length === 0 ? (
        <Text style={[uiType.caption, styles.state]}>Không có kết quả phù hợp</Text>
      ) : (
        options.map((option) => (
          <ListRow
            key={option.id}
            divider
            title={option.label}
            icon={isContract ? "document-text-outline" : "bed-outline"}
            trailing="check"
            selected={selectedId === option.id}
            onPress={() => onSelect(option)}
          />
        ))
      )}
    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  search: { paddingHorizontal: uiSpace.screen, paddingBottom: 8 },
  state: { textAlign: "center", padding: uiSpace.screen },
});

export default InvoiceEntityPickerSheet;
