import { getListTenant, TenantListResponse } from '@/api/tenant/tenant.api';
import AddButton from '@/components/AddButton';
import { CardSkeletonList } from '@/components/CardSkeleton';
import EmptyState from '@/components/EmptyState';
import ScreenHeader from '@/components/ScreenHeader';
import StatCard from '@/components/StatCard';
import { RootStackParamList } from '@/navigation/types';
import { tokens, uiColors, uiSpace } from '@/theme';
import { ApiResponse } from '@/types/api';
import { BasePagingResponse } from '@/types/base.response';
import { formatCurrency } from '@/utils/appUtil';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import TenantCardComponent from './components/TenantCardComponent';

/**
 * TENANT LIST SCREEN — Modern Minimalist.
 *
 * ```
 * ScreenHeader "Khách thuê" · count · [+ Thêm] · search
 * ┌──────────┬──────────┬──────────┐  StatCard × 3 (khách · hợp đồng · doanh thu)
 * TenantCard × n (gap 12, infinite scroll, pull-to-refresh)
 * ```
 */
type TenantListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TenantList'>;
};

const TenantListScreen = ({ navigation }: TenantListScreenProps) => {
  const [search, setSearch] = useState('');

  const { data, isLoading, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<
      ApiResponse<BasePagingResponse<TenantListResponse>>,
      Error
    >({
      queryKey: ['tenants', 1, 5, search],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getListTenant({
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
  const totalTenants = flatData.length;
  let activeContracts = 0;
  flatData.forEach((item) => {
    if (item?.contractStatus === 'active') activeContracts++;
  });
  let totalRevenue = 0;
  flatData.forEach((item) => {
    if (item?.contractStatus === 'active')
      totalRevenue += item?.rentAmount ?? 0;
  });

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const handleCreateTenant = () => {
    // navigation.navigate("CreateTenant");
  };

  const handleTenantPress = (tenantId: string) => {
    navigation.navigate('TenantDetail', { tenantId });
  };

  const handleUpdateTenant = (tenantId: string) => {
    navigation.navigate('UpdateTenant', { tenantId });
  };

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScreenHeader
        title="Khách thuê"
        subtitle={isLoading ? '—' : `${totalTenants} khách thuê`}
        scrollY={scrollY}
        search={{ placeholder: 'Tìm kiếm khách thuê…', onSearch: handleSearch }}
        action={
          <AddButton onPress={handleCreateTenant} accessibilityLabel="Thêm khách thuê" />
        }
      />
      {isLoading ? (
        <View style={styles.loading}>
          <CardSkeletonList count={3} />
        </View>
      ) : (
        <Animated.FlatList
          data={flatData as TenantListResponse[]}
          renderItem={({ item }) => (
            <TenantCardComponent
              tenant={item}
              onPress={() => handleTenantPress(item.id)}
              onUpdate={() => handleUpdateTenant(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <View style={styles.statsRow}>
              <StatCard icon="people-outline" label="Khách thuê" value={totalTenants} />
              <StatCard
                icon="document-text-outline"
                tone="success"
                label="Hợp đồng"
                value={activeContracts}
              />
              <StatCard
                icon="cash-outline"
                tone="warning"
                label="Doanh thu"
                value={formatCurrency(totalRevenue)}
              />
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Không tìm thấy khách thuê"
              description="Thử tìm với tên hoặc số điện thoại khác."
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
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: uiSpace.gap,
  },
});

export default TenantListScreen;
