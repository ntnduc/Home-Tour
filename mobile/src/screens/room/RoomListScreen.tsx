import { getComboProperty } from '@/api/property/property.api';
import { getListRoom } from '@/api/room/room.api';
import BuildingSelector from '@/components/BuildingSelector';
import { CardSkeletonList } from '@/components/CardSkeleton';
import Chip from '@/components/Chip';
import EmptyState from '@/components/EmptyState';
import { useGlobalAppSheet } from '@/components/GlobalAppSheet';
import PaymentSummary from '@/components/PaymentSummary';
import ScreenHeader from '@/components/ScreenHeader';
import { RootStackParamList } from '@/navigation/types';
import { tokens, uiColors, uiSpace } from '@/theme';
import { ApiResponse } from '@/types/api';
import { BasePagingResponse } from '@/types/base.response';
import { ComboOptionWithExtra } from '@/types/comboOption';
import { PaymentStatus } from '@/types/payment';
import { PropertyDetail } from '@/types/property';
import { RoomListResponse } from '@/types/room';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import BuildingFilterComponent from './components/BuildingFilterComponent';
import RoomCardItemComponent from './components/RoomCardItemComponents';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/** Payment filter chips (UI state; list filtering is not wired to the API yet). */
const PAYMENT_FILTERS: { value: PaymentStatus | null; label: string; icon?: IoniconName }[] = [
  { value: null, label: 'Tất cả' },
  { value: PaymentStatus.PENDING, label: 'Chờ', icon: 'time-outline' },
  { value: PaymentStatus.OVERDUE, label: 'Quá hạn', icon: 'warning-outline' },
  { value: PaymentStatus.PAID, label: 'Đã thanh toán', icon: 'checkmark-circle-outline' },
];

/**
 * ROOM LIST SCREEN — Modern Minimalist.
 *
 * ```
 * SafeAreaView edges={[]} · canvas surfaceMuted
 * ┌──────────────────────────────────────────────┐
 * │ ScreenHeader: "Phòng" · search               │
 * │   BuildingSelector (opens picker sheet)      │
 * │   (Tất cả)(Chờ)(Quá hạn)(Đã TT) → chips      │
 * ├──────────────────────────────────────────────┤
 * │ PaymentSummary card                          │
 * │ RoomCard × n (gap 12, infinite scroll)       │
 * └──────────────────────────────────────────────┘
 * ```
 * States: first load → CardSkeletonList · empty → EmptyState · pull-to-refresh.
 */
type RoomListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoomList'>;
};

const RoomListScreen = ({ navigation }: RoomListScreenProps) => {
  const { openAppSheet, closeAppSheet } = useGlobalAppSheet();
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | null>(
    null,
  );
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [comboProperty, setComboProperty] =
    useState<ComboOptionWithExtra<string, string, PropertyDetail>[]>();

  const { data, isLoading, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<ApiResponse<BasePagingResponse<RoomListResponse>>, Error>({
      queryKey: ['rooms', 1, 5, search, selectedBuilding],
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
        // Nothing
        console.error(
          '💞💓💗💞💓💗 ~ error:',
          JSON.stringify(error.response.data.message),
        );
        return [];
      })
      .finally(() => {
        // Nothing
      });
  }, []);

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
      .flatMap((page) => page.data && page.data.items && page.data?.items) ??
    [];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScreenHeader
        title="Phòng"
        scrollY={scrollY}
        search={{
          placeholder: 'Tìm kiếm phòng hoặc tòa nhà…',
          onSearch: (text) => setSearch(text),
        }}
      >
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
                snapPoints: ['40%'],
                header: {
                  title: 'Chọn tòa nhà',
                },
              },
            );
          }}
        />
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

      {isLoading ? (
        <View style={styles.loading}>
          <CardSkeletonList count={3} lines={3} withIcon={false} />
        </View>
      ) : (
        <Animated.FlatList
          data={flatData}
          renderItem={({ item }) =>
            item ? <RoomCardItemComponent item={item} navigation={navigation} /> : null
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
            <EmptyState
              icon="bed-outline"
              title="Không tìm thấy phòng"
              description="Thử tìm với tên phòng hoặc tòa nhà khác."
            />
          }
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
          onEndReachedThreshold={0.2}
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
  chipsBleed: {
    marginHorizontal: -uiSpace.screen,
  },
  chips: {
    paddingHorizontal: uiSpace.screen,
    gap: 8,
  },
  loading: {
    padding: uiSpace.screen,
  },
  listContent: {
    padding: uiSpace.screen,
    paddingBottom: 40,
    flexGrow: 1,
  },
  summary: {
    marginBottom: uiSpace.gap,
  },
  separator: {
    height: uiSpace.gap,
  },
});

export default RoomListScreen;
