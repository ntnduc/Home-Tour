import React from "react";
import {
  HomeHeader, PropertyFilterChips, RevenueHeroCard, StatBento, SectionHeader,
  QuickActionGrid, AlertFeed, RoomStatusCarousel, View, tokens, homeColors, HOME_SPACE,
} from "home-tour-mobile";
import { Phone, noop, summary, alerts, rooms } from "../preview-kit/fixtures";

export const Default = () => (
  <Phone>
    <HomeHeader fullName="Nguyễn Trần Nhật Đức" alertCount={3} onPressBell={noop} onPressAvatar={noop} />
  </Phone>
);

export const NoAlerts = () => (
  <Phone>
    <HomeHeader fullName="Trần Thị Mai" alertCount={0} onPressBell={noop} onPressAvatar={noop} />
  </Phone>
);

/** Reference screen: DashboardScreen composed from its real sections (order + spacing as in the app). */
export const DashboardScreen = () => (
  <Phone pad={0}>
    <View style={{ paddingHorizontal: HOME_SPACE.screen, paddingTop: 8, paddingBottom: 40 }}>
      <View style={{ gap: 18, marginBottom: 22 }}>
        <HomeHeader fullName="Nguyễn Trần Nhật Đức" alertCount={3} onPressBell={noop} onPressAvatar={noop} />
        <PropertyFilterChips properties={summary.properties} onSelect={noop} />
      </View>
      <View style={{ gap: HOME_SPACE.gap + 4 }}>
        <RevenueHeroCard summary={summary} isLoading={false} isFetching={false} onPress={noop} />
        <StatBento summary={summary} isLoading={false} onPressOccupancy={noop} onPressTenants={noop} onPressContracts={noop} />
      </View>
      <View style={{ marginTop: HOME_SPACE.section }}>
        <SectionHeader title="Thao tác nhanh" />
        <QuickActionGrid
          actions={[
            { key: "add-property", label: "Thêm tài sản", icon: "add", color: tokens.colors.primary, onPress: noop },
            { key: "rooms", label: "Phòng", icon: "bed-outline", color: homeColors.ink, onPress: noop },
            { key: "contracts", label: "Hợp đồng", icon: "document-text-outline", color: tokens.colors.success, onPress: noop },
            { key: "invoices", label: "Hóa đơn", icon: "receipt-outline", color: tokens.palette.amber[500], onPress: noop },
          ]}
        />
      </View>
      <View style={{ marginTop: HOME_SPACE.section }}>
        <SectionHeader title="Cần xử lý" count={alerts.length} />
        <AlertFeed alerts={alerts} isLoading={false} isFetching={false} onPressAlert={noop} />
      </View>
      <View style={{ marginTop: HOME_SPACE.section }}>
        <SectionHeader title="Phòng cần chú ý" actionLabel="Tất cả" onPressAction={noop} />
        <RoomStatusCarousel rooms={rooms} isLoading={false} onPressRoom={noop} onPressAction={noop} />
      </View>
    </View>
  </Phone>
);
