/**
 * INVOICE LIST SCREEN — vertical timeline of invoices, newest first.
 *
 * ```
 * SafeAreaView edges={[]} · canvas background
 * ┌──────────────────────────────────────────────┐
 * │ ScreenHeader compact · back                   │
 * │ Hóa đơn                       [filter ⚙ (n)]  │ n = active extra filters
 * │ ┌──── Tìm mã HĐ, phòng, khách thuê… ────────┐ │ SearchField
 * │ (Hợp đồng ⌄)(Phòng ⌄)                         │ quick-filter chips → pickers
 * ├──────────────────────────────────────────────┤
 * │ Hôm nay                                       │ day header
 * │ 14:30  ●─ ┌ card ┐                            │ time · dot/rail · card
 * │ 03/11  │  └──────┘                            │
 * │ Hôm qua …                                     │
 * └──────────────────────────────────────────────┘
 * ```
 *
 * States: first load → timeline skeletons · next page → 1 skeleton · background refetch → opacity 0.6 ·
 * error w/o data → SectionError · empty → EmptyState (filter-aware) · pull-to-refresh.
 */
import { getComboProperty } from "@/api/property/property.api";
import Chip from "@/components/Chip";
import EmptyState from "@/components/EmptyState";
import { useGlobalAppSheet } from "@/components/GlobalAppSheet";
import IconButton from "@/components/IconButton";
import ScreenHeader from "@/components/ScreenHeader";
import SectionError from "@/components/SectionError";
import { RootStackParamList } from "@/navigation/types";
import { tokens, uiColors, uiSpace, uiType } from "@/theme";
import { InvoiceListResponse } from "@/types/invoice";
import { useQuery } from "@tanstack/react-query";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import InvoiceEntityPickerSheet from "./components/InvoiceEntityPickerSheet";
import InvoiceFilterSheet from "./components/InvoiceFilterSheet";
import InvoiceTimelineItem from "./components/InvoiceTimelineItem";
import InvoiceTimelineSkeleton from "./components/InvoiceTimelineSkeleton";
import { useInvoiceListData } from "./hooks/useInvoiceListData";
import { InvoiceTimelineRow } from "./invoiceListFormat";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "InvoiceList">;
  route: RouteProp<RootStackParamList, "InvoiceList">;
};

const InvoiceListScreen = ({ navigation, route }: Props) => {
  const { openAppSheet, closeAppSheet } = useGlobalAppSheet();
  const params = route.params;
  const data = useInvoiceListData({
    room: params?.roomId
      ? { id: params.roomId, label: params.roomName ?? "Phòng đã chọn" }
      : undefined,
    contract: params?.contractId
      ? { id: params.contractId, label: params.contractLabel ?? "Hợp đồng đã chọn" }
      : undefined,
  });
  const scrollY = useSharedValue(0);

  const { data: buildings } = useQuery({
    queryKey: ["property-combo"],
    queryFn: async () => (await getComboProperty()).data ?? [],
    staleTime: 5 * 60_000,
  });

  const openPicker = (kind: "contract" | "room") => {
    const selected = kind === "contract" ? data.contract : data.room;
    openAppSheet(
      <InvoiceEntityPickerSheet
        kind={kind}
        selectedId={selected?.id}
        roomId={kind === "contract" ? data.room?.id : undefined}
        propertyId={data.advanced.propertyId ?? undefined}
        onSelect={(option) => {
          if (kind === "contract") data.setContract(option);
          else data.selectRoom(option);
          closeAppSheet();
        }}
      />,
      {
        snapPoints: ["70%"],
        header: { title: kind === "contract" ? "Chọn hợp đồng" : "Chọn phòng" },
      },
    );
  };

  const openFilters = () => {
    openAppSheet(
      <InvoiceFilterSheet
        initial={data.advanced}
        buildings={buildings ?? []}
        onApply={(next) => {
          data.setAdvanced(next);
          closeAppSheet();
        }}
      />,
      { snapPoints: ["75%"], header: { title: "Bộ lọc hóa đơn" } },
    );
  };

  const handlePress = useCallback(
    (invoice: InvoiceListResponse) =>
      navigation.navigate("InvoiceDetail", { invoiceId: invoice.id, fromHistory: true }),
    [navigation],
  );

  const lastInvoiceKey = [...data.rows].reverse().find((r) => r.type === "invoice")?.key;

  const renderRow = ({ item }: { item: InvoiceTimelineRow }) =>
    item.type === "day" ? (
      <Text style={styles.dayLabel}>{item.label}</Text>
    ) : (
      <InvoiceTimelineItem
        invoice={item.invoice}
        isLast={!data.hasNextPage && item.key === lastInvoiceKey}
        onPress={handlePress}
      />
    );

  const header = (
    <ScreenHeader
      title="Hóa đơn"
      subtitle={data.isLoading ? undefined : `${data.total} hóa đơn`}
      compact
      insetTop
      onBack={() => navigation.goBack()}
      scrollY={scrollY}
      action={
        <View>
          <IconButton
            icon="options-outline"
            accessibilityLabel="Bộ lọc hóa đơn"
            onPress={openFilters}
          />
          {data.advancedCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{data.advancedCount}</Text>
            </View>
          )}
        </View>
      }
      search={{
        placeholder: "Tìm mã HĐ, phòng, khách thuê…",
        onSearch: data.setSearch,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsBleed}
        contentContainerStyle={styles.chips}
      >
        <Chip
          label={data.contract?.label ?? "Hợp đồng"}
          icon="document-text-outline"
          variant="outline"
          selected={!!data.contract}
          onPress={() => openPicker("contract")}
        />
        <Chip
          label={data.room?.label ?? "Phòng"}
          icon="bed-outline"
          variant="outline"
          selected={!!data.room}
          onPress={() => openPicker("room")}
        />
      </ScrollView>
    </ScreenHeader>
  );

  if (data.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        {header}
        <View style={styles.listContent}>
          <InvoiceTimelineSkeleton />
          <InvoiceTimelineSkeleton />
          <InvoiceTimelineSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {header}
      {data.isError && data.rows.length === 0 ? (
        <View style={styles.center}>
          <SectionError message="Không tải được danh sách hóa đơn" onRetry={data.refetch} />
        </View>
      ) : (
        <View
          style={[
            styles.flex,
            { opacity: data.isFetching && !data.isRefreshing && !data.isFetchingNextPage ? 0.6 : 1 },
          ]}
        >
          <FlatList
            data={data.rows}
            renderItem={renderRow}
            keyExtractor={(row) => row.key}
            onScroll={(e) => {
              scrollY.value = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (data.hasNextPage && !data.isFetchingNextPage) data.fetchNextPage();
            }}
            refreshControl={
              <RefreshControl
                refreshing={data.isRefreshing}
                onRefresh={data.refresh}
                tintColor={tokens.colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <EmptyState
                  icon={data.hasActiveFilter ? "search-outline" : "receipt-outline"}
                  title={data.hasActiveFilter ? "Không tìm thấy hóa đơn" : "Chưa có hóa đơn nào"}
                  description={
                    data.hasActiveFilter
                      ? "Thử đổi từ khóa hoặc bỏ bớt bộ lọc."
                      : "Hóa đơn được tạo từ hợp đồng sẽ hiển thị tại đây."
                  }
                />
              </View>
            }
            ListFooterComponent={data.isFetchingNextPage ? <InvoiceTimelineSkeleton /> : null}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: uiColors.canvas },
  flex: { flex: 1 },
  listContent: { paddingHorizontal: uiSpace.screen, paddingTop: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 48 },
  chipsBleed: { marginHorizontal: -uiSpace.screen },
  chips: { paddingHorizontal: uiSpace.screen, gap: 8 },
  dayLabel: { ...uiType.eyebrow, marginTop: 8, marginBottom: 10 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: uiColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 11, lineHeight: 14, fontWeight: "700", color: tokens.colors.surface },
});

export default InvoiceListScreen;
