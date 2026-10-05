import { tokens } from "@/theme";
import { HomepagePropertyOption } from "@/types/homepage";
import { User } from "@/types/user";
import { getStoreUser } from "@/utils/appUtil";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlertFeed from "./components/AlertFeed";
import HomeHeader from "./components/HomeHeader";
import PropertyFilterChips from "./components/PropertyFilterChips";
import QuickActionGrid, { QuickAction } from "./components/QuickActionGrid";
import RevenueHeroCard from "./components/RevenueHeroCard";
import RoomStatusCarousel from "./components/RoomStatusCarousel";
import SectionError from "./components/SectionError";
import SectionHeader from "./components/SectionHeader";
import StatBento from "./components/StatBento";
import { HomeNavigation, openAlert, openRoomAction } from "./homeNavigation";
import { HOME_SPACE, homeColors } from "./homeStyles";
import { useHomepageData } from "./hooks/useHomepageData";

/**
 * TRANG CHỦ — Modern Minimalist Dashboard.
 *
 * Cấu trúc dọc (mắt đọc từ "tôi là ai" → "tiền thế nào" → "phòng ra sao" → "làm gì tiếp"):
 *
 *   ┌───────────────────────────────┐
 *   │ Header: ngày · lời chào · 🔔 ◉ │  ← cá nhân hóa, nền canvas
 *   │ [Tất cả] [Nhà A] [Nhà B] →     │  ← chip lọc (ẩn nếu ≤1 tài sản)
 *   ├───────────────────────────────┤
 *   │ ███ HERO doanh thu + vòng % ███ │  ← full-width, tầng bóng cao nhất
 *   ├──────────────────┬────────────┤
 *   │ Lấp đầy (cao)    │ Khách      │  ← bento BẤT ĐỐI XỨNG
 *   │                  ├────────────┤
 *   │                  │ HĐ hết hạn │
 *   ├──────┬──────┬────┴─┬──────────┤
 *   │  ▣   │  ▣   │  ▣   │    ▣     │  ← thao tác nhanh, lưới ĐỐI XỨNG 4 cột
 *   ├──────┴──────┴──────┴──────────┤
 *   │ Cần xử lý (danh sách dọc)     │  ← live feed: cảnh báo gấp
 *   │ Phòng cần chú ý  ▭ ▭ ▭ →      │  ← live feed: carousel trạng thái phòng
 *   └───────────────────────────────┘
 *
 * Dữ liệu: `useHomepageData` gọi 3 API song song; mỗi section tự xử lý
 * loading (skeleton) / lỗi (retry cục bộ) / rỗng → không section nào chặn section khác.
 * Kéo xuống để làm mới toàn bộ (RefreshControl).
 */
const DashboardScreen = () => {
  const navigation = useNavigation<HomeNavigation>();
  const [user, setUser] = useState<User | undefined>(undefined);
  const scrollRef = useRef<ScrollView>(null);
  const alertsOffsetY = useRef(0);

  const {
    propertyId,
    setPropertyId,
    summary,
    roomFeed,
    alerts,
    isRefreshing,
    refresh,
  } = useHomepageData();

  useEffect(() => {
    getStoreUser().then(setUser);
  }, []);

  // Giữ danh sách chip từ lần tải thành công gần nhất → chip không biến mất khi đang tải/lỗi.
  const [properties, setProperties] = useState<HomepagePropertyOption[]>([]);
  useEffect(() => {
    if (summary.data) setProperties(summary.data.properties);
  }, [summary.data]);

  // Tài sản đang lọc bị xóa/thu hồi quyền → quay về "Tất cả".
  useEffect(() => {
    if (
      propertyId &&
      summary.data &&
      !summary.data.properties.some((p) => p.id === propertyId)
    ) {
      setPropertyId(undefined);
    }
  }, [propertyId, summary.data, setPropertyId]);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        key: "add-property",
        label: "Thêm tài sản",
        icon: "add",
        color: tokens.colors.primary,
        onPress: () => navigation.navigate("CreateProperty"),
      },
      {
        key: "rooms",
        label: "Phòng",
        icon: "bed-outline",
        color: homeColors.ink,
        onPress: () => navigation.navigate("Rooms"),
      },
      {
        key: "contracts",
        label: "Hợp đồng",
        icon: "document-text-outline",
        color: tokens.colors.success,
        onPress: () => navigation.navigate("ContractList"),
      },
      {
        key: "invoices",
        label: "Hóa đơn",
        icon: "receipt-outline",
        color: tokens.palette.amber[500],
        onPress: () => navigation.navigate("InvoiceHistory"),
      },
    ],
    [navigation],
  );

  const alertCount =
    alerts.data?.total ??
    (summary.data
      ? summary.data.overdueInvoiceCount + summary.data.expiringContractCount
      : 0);

  const scrollToAlerts = () =>
    scrollRef.current?.scrollTo({
      y: Math.max(0, alertsOffsetY.current - 12),
      animated: true,
    });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={tokens.colors.primary}
            colors={[tokens.colors.primary]}
          />
        }
      >
        {/* 1. Header cá nhân hóa + chip lọc tài sản */}
        <View style={styles.headerBlock}>
          <HomeHeader
            fullName={user?.fullName}
            alertCount={alertCount}
            onPressBell={scrollToAlerts}
            onPressAvatar={() => navigation.navigate("Profile")}
          />
          <PropertyFilterChips
            properties={properties}
            selectedId={propertyId}
            onSelect={setPropertyId}
          />
        </View>

        {/* 2. Hero tài chính (full-width) + 3. Bento KPI bất đối xứng — cùng nguồn `summary` */}
        {summary.isError ? (
          <SectionError onRetry={summary.retry} />
        ) : (
          <View style={styles.stack}>
            <RevenueHeroCard
              summary={summary.data}
              isLoading={summary.isLoading}
              isFetching={summary.isFetching && !isRefreshing}
              onPress={() => navigation.navigate("InvoiceHistory")}
            />
            <StatBento
              summary={summary.data}
              isLoading={summary.isLoading}
              onPressOccupancy={() => navigation.navigate("Rooms")}
              onPressTenants={() => navigation.navigate("TenantList")}
              onPressContracts={() => navigation.navigate("ContractList")}
            />
          </View>
        )}

        {/* 4. Thao tác nhanh — tĩnh, không phụ thuộc API nên luôn hiển thị */}
        <View style={styles.section}>
          <SectionHeader title="Thao tác nhanh" />
          <QuickActionGrid actions={quickActions} />
        </View>

        {/* 5. Live feed: cảnh báo cần xử lý */}
        <View
          style={styles.section}
          onLayout={(e) => {
            alertsOffsetY.current = e.nativeEvent.layout.y;
          }}
        >
          <SectionHeader title="Cần xử lý" count={alerts.data?.total} />
          {alerts.isError ? (
            <SectionError onRetry={alerts.retry} />
          ) : (
            <AlertFeed
              alerts={alerts.data?.items}
              isLoading={alerts.isLoading}
              isFetching={alerts.isFetching && !isRefreshing}
              onPressAlert={(alert) => openAlert(navigation, alert)}
            />
          )}
        </View>

        {/* 6. Live feed: carousel trạng thái phòng */}
        <View style={styles.section}>
          <SectionHeader
            title="Phòng cần chú ý"
            actionLabel="Tất cả"
            onPressAction={() => navigation.navigate("Rooms")}
          />
          {roomFeed.isError ? (
            <SectionError onRetry={roomFeed.retry} />
          ) : (
            <RoomStatusCarousel
              rooms={roomFeed.data}
              isLoading={roomFeed.isLoading}
              onPressRoom={(room) =>
                navigation.navigate("RoomDetail", { roomId: room.roomId })
              }
              onPressAction={(room) => openRoomAction(navigation, room)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: homeColors.canvas },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: HOME_SPACE.screen,
    paddingTop: 8,
    paddingBottom: 40,
  },
  headerBlock: { gap: 18, marginBottom: 22 },
  stack: { gap: HOME_SPACE.gap + 4 },
  section: { marginTop: HOME_SPACE.section },
});

export default DashboardScreen;
