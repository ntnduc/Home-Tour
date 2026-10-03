import { getListProperty } from "@/api/property/property.api";
import FabButton from "@/components/FabButton";
import Loading from "@/components/Loading";
import { ApiResponse } from "@/types/api";
import { BasePagingResponse } from "@/types/base.response";
import { PropertyListResponse } from "@/types/property";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import HeaderComponents from "../common/HeaderComponents";
import PropertyCardComponent from "./components/PropertyCardComponent";

type PropertyListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "PropertyList">;
};

const PropertyListScreen = ({ navigation }: PropertyListScreenProps) => {
  const [search, setSearch] = useState("");

  const { data, isLoading, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      ApiResponse<BasePagingResponse<PropertyListResponse>>,
      Error
    >({
      queryKey: ["properties", 1, 5, search],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getListProperty({
          limit: 5,
          offset: ((pageParam as number) - 1) * 5,
          globalKey: search,
        }),
      getNextPageParam: (lastPage, pages) => {
        return lastPage.data?.total && lastPage.data?.total > pages.length
          ? pages.length + 1
          : undefined;
      },
    });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const flatData = data?.pages.flatMap((page) => page.data?.items) || [];
  const totalBuildings = flatData.length;
  let totalRooms = 0;
  flatData.forEach((item) => {
    totalRooms += item?.totalRoom ?? 0;
  });
  let totalTenants = 0;
  flatData.forEach((item) => {
    totalTenants += item?.totalRoomOccupied ?? 0;
  });

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const handleCreateProperty = () => {
    navigation.navigate("CreateProperty");
  };

  const handlePropertyPress = (propertyId: string) => {
    navigation.navigate("PropertyDetail", { propertyId });
  };

  const handleUpdateProperty = (propertyId: string) => {
    navigation.navigate("UpdateProperty", { propertyId });
  };

  const handleViewRooms = (propertyId: string) => {
    navigation.navigate("RoomList", { propertyId });
  };

  const handleAddRoom = (propertyId: string) => {
    navigation.navigate("CreateRoom", { propertyId });
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        backgroundColor: colors.background.default,
        flex: 1,
      }}
    >
      {/* <StatusBar barStyle="dark-content" backgroundColor={"#fff"} /> */}
      <HeaderComponents
        title="Quản lý tài sản"
        isSearch
        searchConfig={{
          placeholder: "Tìm kiếm tài sản...",
          onSearch: handleSearch,
          className: "mx-2",
        }}
      />
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <Loading />
        </View>
      )}
      {!isLoading && (
        <View style={{ flex: 1, backgroundColor: colors.background.paper }}>
          <FlatList
            data={flatData as PropertyListResponse[]}
            renderItem={({ item }) => {
              return (
                <PropertyCardComponent
                  property={item}
                  onPress={() => handlePropertyPress(item.id)}
                  onEdit={() => handleUpdateProperty(item.id)}
                  onViewRooms={() => handleViewRooms(item.id)}
                  onAddRoom={() => handleAddRoom(item.id)}
                />
              );
            }}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => {
                  refetch();
                }}
              />
            }
            ListHeaderComponent={
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statsBox,
                    { backgroundColor: colors.primary.light },
                  ]}
                >
                  <Text style={styles.statsIcon}>🏢</Text>
                  <Text style={styles.statsValue}>{totalBuildings}</Text>
                  <Text style={styles.statsLabel}>Tài sản</Text>
                </View>
                <View
                  style={[
                    styles.statsBox,
                    { backgroundColor: colors.status.success + "20" },
                  ]}
                >
                  <Text style={styles.statsIcon}>🔑</Text>
                  <Text style={styles.statsValue}>{totalRooms}</Text>
                  <Text style={styles.statsLabel}>Phòng</Text>
                </View>
                <View
                  style={[
                    styles.statsBox,
                    { backgroundColor: colors.status.warning + "20" },
                  ]}
                >
                  <Text style={styles.statsIcon}>👤</Text>
                  <Text style={styles.statsValue}>{totalTenants}</Text>
                  <Text style={styles.statsLabel}>Đã thuê</Text>
                </View>
              </View>
            }
            contentContainerStyle={{ padding: 10 }}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              fetchNextPage();
            }}
            ListEmptyComponent={
              <View className="items-center mt-10">
                <Text style={{ color: colors.text.secondary }}>
                  Không tìm thấy tài sản phù hợp.
                </Text>
              </View>
            }
          />
        </View>
      )}
      <FabButton
        icon="add"
        iconSize={32}
        iconStyle={{ marginTop: -2 }}
        onPress={handleCreateProperty}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  statsBox: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: colors.background.paper,
    shadowColor: colors.neutral.black,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statsIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  statsValue: {
    fontWeight: "bold",
    fontSize: 18,
    color: colors.primary.main,
  },
  statsLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

export default PropertyListScreen;
