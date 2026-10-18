/**
 * ROOM LIST SCREEN — Compact header + Modern Minimalist card redesign.
 *
 * ```
 * SafeAreaView edges={[]} · canvas background
 * ┌──────────────────────────────────────────────┐
 * │ ScreenHeader compact                          │ paddingTop 4 · paddingBottom 12 · gap 10
 * │ Phòng                    [▣ Tất cả tòa nhà ⌄] │ title 24/30 · BuildingSelector variant="pill" action
 * │ ┌──────── Tìm kiếm phòng hoặc tòa nhà… ────┐ │ SearchField
 * │ └──────────────────────────────────────────┘ │
 * │ (Tất cả)(⏱ Chờ)(⚠ Quá hạn)(✓ Đã thanh toán) │ chips (unchanged)
 * ├──────────────────────────────────────────────┤
 * │ wrapper opacity 0.6 (while isFetching)       │
 * │  Animated.FlatList  padding 20 · top 16 · bot 40
 * │   PaymentSummary (unchanged)                 │
 * │   RoomCard (redesigned)                      │
 * │   ── gap 12 ──                               │
 * │   RoomCard …                                 │
 * │   footer: RoomCardSkeleton (next page) · 1 │
 * └──────────────────────────────────────────────┘
 * ```
 *
 * States:
 * - First load: 3 × RoomCardSkeleton (padding 20, top 16, gap 12)
 * - Fetching next page: 1 × RoomCardSkeleton (marginTop 12)
 * - Background refetch: list opacity 0.6
 * - Error with no data: SectionError centered
 * - Empty: EmptyState (search-aware or "no rooms" with "Add" action if building selected)
 * - Pull-to-refresh: RefreshControl bound to isRefreshing
 */
import { getComboProperty } from "@/api/property/property.api";
import { getListRoom } from "@/api/room/room.api";
import BuildingSelector from "@/components/BuildingSelector";
import Chip from "@/components/Chip";
import EmptyState from "@/components/EmptyState";
import { useGlobalAppSheet } from "@/components/GlobalAppSheet";
import PaymentSummary from "@/components/PaymentSummary";
import ScreenHeader from "@/components/ScreenHeader";
import SectionError from "@/components/SectionError";
import { RootStackParamList } from "@/navigation/types";
import { tokens, uiColors, uiSpace } from "@/theme";
import { ApiResponse } from "@/types/api";
import { BasePagingResponse } from "@/types/base.response";
import { ComboOptionWithExtra } from "@/types/comboOption";
import { PaymentStatus } from "@/types/payment";
import { PropertyDetail } from "@/types/property";
import { RoomListResponse } from "@/types/room";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import BuildingFilterComponent from "./components/BuildingFilterComponent";
import RoomCardItemComponent from "./components/RoomCardItemComponents";
import RoomCardSkeleton from "./components/RoomCardSkeleton";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/** Payment filter chips (UI state; list filtering is not wired to the API yet). */
const PAYMENT_FILTERS: { value: PaymentStatus | null; label: string; icon?: IoniconName }[] = [
  { value: null, label: "Tất cả" },
  { value: PaymentStatus.PENDING, label: "Chờ", icon: "time-outline" },
  { value: PaymentStatus.OVERDUE, label: "Quá hạn", icon: "warning-outline" },
  { value: PaymentStatus.PAID, label: "Đã thanh toán", icon: "checkmark-circle-outline" },
];

type RoomListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoomList">;
};

const RoomListScreen = ({ navigation }: RoomListScreenProps) => {
  const { openAppSheet, closeAppSheet } = useGlobalAppSheet();
  const [search, setSearch] = useState("");
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [comboProperty, setComboProperty] =
    useState<ComboOptionWithExtra<string, string, PropertyDetail>[]>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFirstFocus = useRef(true);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery<ApiResponse<BasePagingResponse<RoomListResponse>>, Error>({
    queryKey: ["rooms", 1, 5, search, selectedBuilding],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getListRoom({
        limit: 5,
        offset: ((pageParam as number) - 1) * 5,
        globalKey: search,
        filters: {
          propertyId: selectedBuilding,
        },
      }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data?.total && lastPage.data?.total > pages.length
        ? pages.length + 1
        : undefined;
    },
  });

  useEffect(() => {
    getComboProperty()
      .then((response) => {
        const data = response.data;
        const options = [...(data ?? [])];
        setComboProperty(options);
      })
      .catch((error) => {
        console.error(
          "Failed to load building options:",
          JSON.stringify(error.response?.data?.message),
        );
        return [];
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const flatData =
    data?.pages
      .filter((page) => page.data && page.data.items !== undefined)
      .flatMap((page) => page.data?.items ?? [])
      .filter(Boolean) ?? [];

  // Show 3 skeletons on first load
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <ScreenHeader
          title="Phòng"
          compact
          scrollY={scrollY}
          action={
            <BuildingSelector
              buildings={comboProperty ?? []}
              selectedBuilding={selectedBuilding}
              onOpen={() => {
                openAppSheet(
                  <BuildingFilterComponent
                    buildings={comboProperty ?? []}
                    selectedBuilding={selectedBuilding}
                    onSelectedBuiling={(id) => {
                      setSelectedBuilding(id);
                      closeAppSheet();
                    }}
                  />,
                  {
                    snapPoints: ["40%"],
                    header: {
                      title: "Chọn tòa nhà",
                    },
                  },
                );
              }}
              variant="pill"
            />
          }
          search={{
            placeholder: "Tìm kiếm phòng hoặc tòa nhà…",
            onSearch: (text) => setSearch(text),
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsBleed}
            contentContainerStyle={styles.chips}
          >
            {PAYMENT_FILTERS.map((filter) => (
              <Chip
                key={filter.label}
                label={filter.label}
                icon={filter.icon}
                variant="outline"
                selected={filterPayment === filter.value}
                onPress={() => setFilterPayment(filter.value)}
              />
            ))}
          </ScrollView>
        </ScreenHeader>

        <View style={styles.skeletonContainer}>
          <RoomCardSkeleton />
          <RoomCardSkeleton />
          <RoomCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScreenHeader
        title="Phòng"
        compact
        scrollY={scrollY}
        action={
          <BuildingSelector
            buildings={comboProperty ?? []}
            selectedBuilding={selectedBuilding}
            onOpen={() => {
              openAppSheet(
                <BuildingFilterComponent
                  buildings={comboProperty ?? []}
                  selectedBuilding={selectedBuilding}
                  onSelectedBuiling={(id) => {
                    setSelectedBuilding(id);
                    closeAppSheet();
                  }}
                />,
                {
                  snapPoints: ["40%"],
                  header: {
                    title: "Chọn tòa nhà",
                  },
                },
              );
            }}
            variant="pill"
          />
        }
        search={{
          placeholder: "Tìm kiếm phòng hoặc tòa nhà…",
          onSearch: (text) => setSearch(text),
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsBleed}
          contentContainerStyle={styles.chips}
        >
          {PAYMENT_FILTERS.map((filter) => (
            <Chip
              key={filter.label}
              label={filter.label}
              icon={filter.icon}
              variant="outline"
              selected={filterPayment === filter.value}
              onPress={() => setFilterPayment(filter.value)}
            />
          ))}
        </ScrollView>
      </ScreenHeader>

      {/* Error state with no data */}
      {isError && flatData.length === 0 ? (
        <View style={styles.centerContent}>
          <SectionError
            message="Không tải được danh sách phòng"
            onRetry={refetch}
          />
        </View>
      ) : (
        <Animated.View
          style={[
            styles.listWrapper,
            {
              opacity: isFetching && !isRefreshing && !isFetchingNextPage ? 0.6 : 1,
            },
          ]}
        >
          <Animated.FlatList
            data={flatData}
            renderItem={({ item }) =>
              item ? (
                <RoomCardItemComponent item={item} navigation={navigation} />
              ) : null
            }
            keyExtractor={(item, index) => item?.id ?? index.toString()}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.summary}>
                <PaymentSummary
                  totalRooms={0}
                  pendingPayments={0}
                  overduePayments={0}
                  paidPayments={0}
                  totalAmount={0}
                />
              </View>
            }
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <EmptyState
                  icon={search ? "search-outline" : "bed-outline"}
                  title={
                    search
                      ? "Không tìm thấy phòng"
                      : "Chưa có phòng nào"
                  }
                  description={
                    search
                      ? "Thử tìm với tên phòng hoặc tòa nhà khác."
                      : "Thêm phòng cho tòa nhà để bắt đầu quản lý hợp đồng và hoá đơn."
                  }
                  actionLabel={
                    !search && selectedBuilding ? "Thêm phòng" : undefined
                  }
                  onPressAction={
                    !search && selectedBuilding
                      ? () => {
                          navigation.navigate("CreateRoom", {
                            propertyId: selectedBuilding,
                          });
                        }
                      : undefined
                  }
                />
              </View>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footerSkeleton}>
                  <RoomCardSkeleton />
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={tokens.colors.primary}
                colors={[tokens.colors.primary]}
              />
            }
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.2}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: uiColors.canvas,
  },
  chipsBleed: {
    marginHorizontal: -uiSpace.screen,
  },
  chips: {
    paddingHorizontal: uiSpace.screen,
    gap: 8,
  },
  skeletonContainer: {
    paddingHorizontal: uiSpace.screen,
    paddingTop: 16,
    gap: 12,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: uiSpace.screen,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  summary: {
    marginBottom: uiSpace.gap,
  },
  separator: {
    height: uiSpace.gap,
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: uiSpace.screen,
    justifyContent: "center",
    alignItems: "center",
  },
  footerSkeleton: {
    marginTop: uiSpace.gap,
  },
});

export default RoomListScreen;
