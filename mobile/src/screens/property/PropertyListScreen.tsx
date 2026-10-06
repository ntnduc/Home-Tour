/**
 * PROPERTY LIST SCREEN — Modern Minimalist redesign.
 *
 * Layout (fixed header + infinite FlatList on muted canvas):
 * ```
 * SafeAreaView edges={["top"]}  ·  canvas = colors.surfaceMuted
 * ┌──────────────────────────────────────────────┐
 * │  FIXED HEADER (title + count + "+ Thêm" + search)
 * ├──────────────────────────────────────────────┤
 * │  FlatList (gap 12, pull-to-refresh)
 * │  ┌──────────────────────────────────────────┐
 * │  │  Property Card (shadow soft · radius 24)  │
 * │  │  ┌─ pressable header + meta              │
 * │  │  ├─ hairline                             │
 * │  │  └─ action row (view/add rooms + edit)  │
 * │  └──────────────────────────────────────────┘
 * │  … next property …
 * │  Loading skeleton OR error OR empty
 * └──────────────────────────────────────────────┘
 * ```
 *
 * States:
 * - **Loading (first)**: 3 × PropertyCardSkeleton
 * - **Fetching (background)**: list dimmed to opacity 0.6
 * - **Error**: SectionError + retry (replaces list body)
 * - **Empty**: EmptyState (search-aware variant)
 * - **Footer (next page loading)**: 1 × PropertyCardSkeleton
 * - **Pull-to-refresh**: RefreshControl → `isRefreshing` (not `isFetching`)
 * - **Scroll end**: `onEndReached` → `loadMore` (if `hasNextPage`)
 */

import { tokens } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import SectionError from "@/components/SectionError";
import { PropertyListNavigation } from "./propertyNavigation";
import { usePropertyListData } from "./hooks/usePropertyListData";
import PropertyListHeader from "./components/PropertyListHeader";
import PropertyCardComponent from "./components/PropertyCardComponent";
import PropertyCardSkeleton from "./components/PropertyCardSkeleton";
import { PROP_SPACE, propColors } from "./propertyListStyles";

const PropertyListScreen = () => {
  const navigation = useNavigation<PropertyListNavigation>();
  const {
    search,
    setSearch,
    properties,
    total,
    isLoading,
    isFetching,
    isError,
    retry,
    isRefreshing,
    refresh,
    isFetchingNextPage,
    loadMore,
  } = usePropertyListData();

  const handlePressCreate = () => {
    navigation.navigate("CreateProperty");
  };

  const handlePropertyPress = (propertyId: string) => {
    navigation.navigate("PropertyDetail", { propertyId });
  };

  const handleEditProperty = (propertyId: string) => {
    navigation.navigate("UpdateProperty", { propertyId });
  };

  const handleViewRooms = (propertyId: string) => {
    navigation.navigate("RoomList", { propertyId });
  };

  const handleAddRoom = (propertyId: string) => {
    navigation.navigate("CreateRoom", { propertyId });
  };

  // Render: first load → 3 skeletons
  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: propColors.canvas }]}
      >
        <PropertyListHeader
          total={total}
          isLoading={isLoading}
          onPressCreate={handlePressCreate}
          onSearch={setSearch}
        />
        <View style={styles.loadingWrapper}>
          {[0, 1, 2].map((i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // Render: error with no data → SectionError
  if (isError && properties.length === 0) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: propColors.canvas }]}
      >
        <PropertyListHeader
          total={0}
          isLoading={false}
          onPressCreate={handlePressCreate}
          onSearch={setSearch}
        />
        <View style={styles.errorWrapper}>
          <SectionError
            message="Không tải được danh sách tài sản"
            onRetry={retry}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: propColors.canvas }]}
    >
      <PropertyListHeader
        total={total}
        isLoading={isLoading}
        onPressCreate={handlePressCreate}
        onSearch={setSearch}
      />

      {/* FlatList — dim to 0.6 opacity while isFetching (background refetch) */}
      <View
        style={[
          styles.listWrapper,
          { opacity: isFetching && !isRefreshing ? 0.6 : 1 },
        ]}
      >
        <FlatList
          data={properties}
          renderItem={({ item }) => (
            <PropertyCardComponent
              property={item}
              onPress={() => handlePropertyPress(item.id)}
              onEdit={() => handleEditProperty(item.id)}
              onViewRooms={() => handleViewRooms(item.id)}
              onAddRoom={() => handleAddRoom(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => (
            <View style={{ height: PROP_SPACE.gap }} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={tokens.colors.primary}
              colors={[tokens.colors.primary]}
            />
          }
          // Empty state: no data + no error
          ListEmptyComponent={
            search ? (
              <EmptyState
                icon="search-outline"
                title="Không tìm thấy tài sản"
                description="Thử tìm với tên hoặc địa chỉ khác."
              />
            ) : (
              <EmptyState
                icon="business-outline"
                title="Chưa có tài sản nào"
                description="Thêm tài sản đầu tiên để bắt đầu quản lý phòng, hợp đồng và hóa đơn."
                actionLabel="Thêm tài sản"
                onPressAction={handlePressCreate}
              />
            )
          }
          // Footer: show 1 skeleton while fetching next page
          ListFooterComponent={
            isFetchingNextPage ? <PropertyCardSkeleton /> : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
  },
  loadingWrapper: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: PROP_SPACE.screen,
    paddingTop: 4,
    gap: PROP_SPACE.gap,
  },
  errorWrapper: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: PROP_SPACE.screen,
    paddingTop: 4,
    gap: PROP_SPACE.gap,
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: PROP_SPACE.screen,
    paddingTop: 4,
    paddingBottom: 40,
    flexGrow: 1,
  },
});

export default PropertyListScreen;
