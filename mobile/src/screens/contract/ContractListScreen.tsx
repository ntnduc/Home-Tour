import { getListContract } from "@/api/contract/contract.api";
import AddButton from "@/components/AddButton";
import { CardSkeletonList } from "@/components/CardSkeleton";
import EmptyState from "@/components/EmptyState";
import ScreenHeader from "@/components/ScreenHeader";
import { tokens, uiColors, uiSpace } from "@/theme";
import { ApiResponse } from "@/types/api";
import { BasePagingResponse } from "@/types/base.response";
import { useFocusEffect } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContractListResponse } from "../../types/contract";
import ContractCard from "./components/ContractCard";

type ContractListScreenProps = {
  navigation: any;
};

/**
 * CONTRACT LIST SCREEN — Modern Minimalist.
 *
 * ```
 * ScreenHeader "Hợp đồng" · [+ Thêm] (→ chọn phòng) · search
 * ContractCard × n (gap 12, infinite scroll, pull-to-refresh)
 * ```
 */
const ContractListScreen = ({ navigation }: ContractListScreenProps) => {
  const [search, setSearch] = useState("");

  const { data, isLoading, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<ApiResponse<BasePagingResponse<ContractListResponse>>, Error>({
      queryKey: ["contract", 1, 5, search],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getListContract({
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

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const flatData =
    data?.pages
      .filter((page) => page.data && page.data.items !== undefined)
      .flatMap((page) => page.data?.items ?? []) ?? [];
  const total = data?.pages[0]?.data?.total;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScreenHeader
        title="Hợp đồng"
        subtitle={isLoading ? "—" : `${total ?? flatData.length} hợp đồng`}
        scrollY={scrollY}
        search={{ placeholder: "Tìm kiếm hợp đồng…", onSearch: setSearch }}
        action={
          <AddButton
            // Navigate to room list to select a room for creating contract
            onPress={() => navigation.navigate("RoomList")}
            accessibilityLabel="Tạo hợp đồng"
          />
        }
      />

      {isLoading ? (
        <View style={styles.loading}>
          <CardSkeletonList count={3} withIcon={false} />
        </View>
      ) : (
        <Animated.FlatList
          data={flatData}
          renderItem={({ item }) => (
            <ContractCard
              contract={item}
              onPress={() => navigation.navigate("ContractDetail", { contractId: item.id })}
              showActions={true}
              onViewDetails={() => navigation.navigate("ContractDetail", { contractId: item.id })}
              onTerminate={() => navigation.navigate("TerminateContract", { contractId: item.id })}
              onRenew={() => {
                // TODO: Implement renew contract
              }}
            />
          )}
          keyExtractor={(item, index) => item?.id ?? index.toString()}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="document-outline"
              title="Không tìm thấy hợp đồng"
              description="Thử thay đổi từ khóa tìm kiếm."
            />
          }
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.2}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                refetch();
              }}
              tintColor={tokens.colors.primary}
              colors={[tokens.colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: uiColors.canvas,
  },
  loading: {
    padding: uiSpace.screen,
  },
  listContent: {
    padding: uiSpace.screen,
    paddingBottom: 40,
    flexGrow: 1,
  },
  separator: {
    height: uiSpace.gap,
  },
});

export default ContractListScreen;
