/**
 * ROOM DETAIL SCREEN — Modern Minimalist, real data.
 *
 * ```
 * SafeAreaView edges={[]} · canvas background
 * ┌──────────────────────────────────────────────┐
 * │ ScreenHeader  (‹) Chi tiết phòng       (✎)   │ back · edit action
 * ├──────────────────────────────────────────────┤
 * │ ScrollView  padding 20 · gap 12              │
 * │  Room card: images · name · rent · chips · QR│
 * │  Hợp đồng hiện tại (ACTIVE only, tappable)   │
 * │  Người ở hiện tại (active contract clients)  │
 * │  Lịch sử hợp đồng (collapsible, lazy-loaded) │
 * │  Hóa đơn (collapsible, lazy-loaded)          │
 * └──────────────────────────────────────────────┘
 * ```
 *
 * States: first load → skeletons · background refetch → opacity 0.6 ·
 * room error w/o data → SectionError · contracts error → inline SectionError.
 */
import Card from "@/components/Card";
import Chip from "@/components/Chip";
import CollapsibleSection from "@/components/CollapsibleSection";
import FormSection from "@/components/FormSection";
import IconButton from "@/components/IconButton";
import ListBody from "@/components/ListBody";
import ListRow from "@/components/ListRow";
import NoticeBanner from "@/components/NoticeBanner";
import ScreenHeader from "@/components/ScreenHeader";
import SectionError from "@/components/SectionError";
import SkeletonBlock from "@/components/SkeletonBlock";
import StatusBadge from "@/components/StatusBadge";
import { getFileUrl } from "@/components/Uploadfile/uploadfile.api";
import { ROOM_STATUS_BADGE } from "@/constant/room.constant";
import { RootStackParamList } from "@/navigation/types";
import { tokens, uiColors, uiRadius, uiSpace, uiType } from "@/theme";
import {
  CONTRACT_STATUS_BADGE,
  ContractListResponse,
  ContractStatus,
} from "@/types/contract";
import { INVOICE_STATUS_BADGE, InvoiceListResponse } from "@/types/invoice";
import { RoomDetailResponse } from "@/types/room";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoomDetailData } from "./hooks/useRoomDetailData";
import { useRoomHistoryContracts, useRoomInvoices } from "./hooks/useRoomLazyLists";

type RoomDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "RoomDetail"
>;

/** Contract status → StatusBadge (falls back to neutral for unknown statuses). */
const ContractBadge = ({ status }: { status: ContractStatus }) => {
  const badge = CONTRACT_STATUS_BADGE[status] ?? {
    label: String(status),
    tone: "neutral" as const,
  };
  return <StatusBadge size="sm" label={badge.label} tone={badge.tone} />;
};

/** Horizontal carousel of room photos. */
const RoomImageCarousel = ({ fileIds }: { fileIds: string[] }) => (
  <FlatList
    data={fileIds}
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={(id) => id}
    renderItem={({ item }) => (
      <Image source={{ uri: getFileUrl(item) }} style={styles.image} />
    )}
    contentContainerStyle={styles.imageRow}
  />
);

/** Room info card: photos, name, rent, status, chips, note and QR. */
const RoomInfoCard = ({
  room,
  fileIds,
}: {
  room: RoomDetailResponse;
  fileIds: string[];
}) => {
  const badge = ROOM_STATUS_BADGE[room.status] ?? ROOM_STATUS_BADGE.UNAVAILABLE;
  return (
    <Card style={styles.cardGap}>
      {fileIds.length > 0 && <RoomImageCarousel fileIds={fileIds} />}
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Text style={uiType.section}>{room.name}</Text>
          {room.propertyName || room.property?.name ? (
            <Text style={uiType.caption}>
              {room.propertyName ?? room.property?.name}
            </Text>
          ) : null}
          <Text style={styles.price}>
            {formatCurrency(room.rentAmount ?? 0)}đ/tháng
          </Text>
        </View>
        <StatusBadge label={badge.label} tone={badge.tone} />
      </View>
      <View style={styles.chipWrap}>
        {room.floor ? (
          <Chip icon="layers-outline" label={`Tầng ${room.floor}`} />
        ) : null}
        {room.area ? (
          <Chip icon="resize-outline" label={`${room.area}m²`} />
        ) : null}
        {room.maxOccupancy ? (
          <Chip
            icon="people-outline"
            label={`Tối đa ${room.maxOccupancy} người`}
          />
        ) : null}
        {room.defaultDepositAmount ? (
          <Chip
            icon="wallet-outline"
            label={`Cọc ${formatCurrency(room.defaultDepositAmount)}đ`}
          />
        ) : null}
        {room.defaultPaymentDueDay ? (
          <Chip
            icon="calendar-outline"
            label={`Hạn thanh toán ngày ${room.defaultPaymentDueDay}`}
          />
        ) : null}
      </View>
      {room.description ? (
        <NoticeBanner
          tone="warning"
          title="Ghi chú"
          message={room.description}
        />
      ) : null}
      <View style={styles.qrRow}>
        <QRCode value={`ROOM-${room.id}`} size={60} />
        <Text style={[uiType.caption, styles.flex]}>
          QR phòng: Quét để check-in/check-out hoặc chia sẻ nhanh
        </Text>
      </View>
    </Card>
  );
};

/** Tenant (landlord client) name of a contract. */
const getTenantName = (contract: ContractListResponse) =>
  contract.client?.find((c) => c.isLandlordClient)?.name ??
  contract.client?.[0]?.name ??
  "Chưa có khách thuê";

const dateRange = (contract: ContractListResponse) =>
  `${formatDate(contract.startDate)} – ${contract.endDate ? formatDate(contract.endDate) : "Không thời hạn"}`;

/** Current (ACTIVE) contract — the whole card opens the contract detail. */
const CurrentContractCard = ({
  contract,
  onPress,
}: {
  contract: ContractListResponse;
  onPress: () => void;
}) => (
  <Card
    onPress={onPress}
    accessibilityLabel="Xem chi tiết hợp đồng"
    style={styles.cardGap}
  >
    <View style={styles.titleRow}>
      <View style={styles.flex}>
        <Text style={uiType.eyebrow}>HỢP ĐỒNG HIỆN TẠI</Text>
        <Text style={uiType.bodyStrong}>{getTenantName(contract)}</Text>
      </View>
      <ContractBadge status={contract.status} />
    </View>
    <View style={styles.rowGap}>
      <Text style={uiType.caption}>HĐ #{contract.code}</Text>
      <Text style={uiType.caption}>Thời gian: {dateRange(contract)}</Text>
      <Text style={uiType.caption}>
        Giá thuê: {formatCurrency(contract.rentAmountAgreed ?? 0)}đ/tháng
      </Text>
    </View>
    <View style={styles.linkRow}>
      <Text style={styles.link}>Xem chi tiết hợp đồng</Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={tokens.colors.primary}
      />
    </View>
  </Card>
);

/** People currently living in the room (active clients of the active contract). */
const CurrentResidentsCard = ({
  contract,
  scroll,
  maxHeight,
}: {
  contract: ContractListResponse;
  scroll?: boolean;
  maxHeight?: number;
}) => {
  const residents = (contract.client ?? []).filter(
    (c) => c.isActiveInContract !== false,
  );
  if (residents.length === 0) return null;
  return (
    <FormSection
      title={`Người ở hiện tại (${residents.length})`}
      icon="people-outline"
    >
      <ListBody scroll={scroll} maxHeight={maxHeight}>
        {residents.map((r, idx) => (
          <ListRow
            key={r.id}
            divider={idx > 0}
            icon="person-outline"
            title={r.isLandlordClient ? `${r.name} · Chủ hợp đồng` : r.name}
            subtitle={r.phoneNumber ?? r.client?.phoneNumber ?? undefined}
          />
        ))}
      </ListBody>
    </FormSection>
  );
};

/** Skeleton rows shown while a lazy section loads. */
const ListSkeleton = () => (
  <View style={styles.sections}>
    {[0, 1, 2].map((i) => (
      <SkeletonBlock key={i} height={52} radius={uiRadius.icon} />
    ))}
  </View>
);

/** Collapsible past contracts; the API is called only after the tab is opened. */
const ContractHistoryList = ({
  roomId,
  onPressItem,
}: {
  roomId: string;
  onPressItem: (contract: ContractListResponse) => void;
}) => {
  // Latch: once opened, keep the data enabled even after the section closes
  const [opened, setOpened] = useState(false);
  const query = useRoomHistoryContracts(roomId, opened);
  const contracts = query.data ?? [];

  return (
    <CollapsibleSection
      title="Lịch sử hợp đồng"
      icon="time-outline"
      onToggle={(expanded) => expanded && setOpened(true)}
    >
      {query.isLoading ? (
        <ListSkeleton />
      ) : query.isError ? (
        <SectionError
          message="Không tải được lịch sử hợp đồng"
          onRetry={() => query.refetch()}
        />
      ) : contracts.length === 0 ? (
        <Text style={uiType.caption}>Chưa có hợp đồng nào trong quá khứ.</Text>
      ) : (
        <ListBody scroll maxHeight={300}>
          {contracts.map((contract, idx) => (
            <ListRow
              key={contract.id}
              divider={idx > 0}
              title={getTenantName(contract)}
              subtitle={dateRange(contract)}
              trailing={
                <View style={styles.historyTrailing}>
                  <ContractBadge status={contract.status} />
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={uiColors.textSubtle}
                  />
                </View>
              }
              onPress={() => onPressItem(contract)}
            />
          ))}
        </ListBody>
      )}
    </CollapsibleSection>
  );
};

/** Collapsible invoices of the room; the API is called only after the tab is opened. */
const RoomInvoiceList = ({
  roomId,
  onPressItem,
}: {
  roomId: string;
  onPressItem: (invoice: InvoiceListResponse) => void;
}) => {
  const [opened, setOpened] = useState(false);
  const query = useRoomInvoices(roomId, opened);
  const invoices = query.data ?? [];

  return (
    <CollapsibleSection
      title="Hóa đơn"
      icon="receipt-outline"
      onToggle={(expanded) => expanded && setOpened(true)}
    >
      {query.isLoading ? (
        <ListSkeleton />
      ) : query.isError ? (
        <SectionError
          message="Không tải được hóa đơn"
          onRetry={() => query.refetch()}
        />
      ) : invoices.length === 0 ? (
        <Text style={uiType.caption}>Chưa có hóa đơn nào.</Text>
      ) : (
        <ListBody scroll maxHeight={300}>
          {invoices.map((invoice, idx) => {
            const badge = INVOICE_STATUS_BADGE[invoice.status] ?? {
              label: String(invoice.status),
              tone: "neutral" as const,
            };
            return (
              <ListRow
                key={invoice.id}
                divider={idx > 0}
                title={`${invoice.code ?? "Hóa đơn"} · ${formatCurrency(invoice.totalAmount ?? 0)}đ`}
                subtitle={`${formatDate(String(invoice.billingPeriodStart))} - ${formatDate(String(invoice.billingPeriodEnd))}`}
                trailing={
                  <View style={styles.historyTrailing}>
                    <StatusBadge size="sm" label={badge.label} tone={badge.tone} />
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={uiColors.textSubtle}
                    />
                  </View>
                }
                onPress={() => onPressItem(invoice)}
              />
            );
          })}
        </ListBody>
      )}
    </CollapsibleSection>
  );
};

/** Shaped skeleton shown on the first load. */
const RoomDetailSkeleton = () => (
  <View style={styles.content}>
    <SkeletonBlock height={220} radius={uiRadius.card} />
    <SkeletonBlock height={140} radius={uiRadius.card} />
    <SkeletonBlock height={120} radius={uiRadius.card} />
  </View>
);

const RoomDetailScreen = ({ navigation, route }: RoomDetailScreenProps) => {
  const { roomId } = route.params;
  const { room, contracts, images, isRefreshing, refresh } =
    useRoomDetailData(roomId);

  const handlePressContract = (contract: ContractListResponse) => {
    navigation.navigate("ContractDetail", { contractId: contract.id });
  };

  const roomData = room.data;
  const allContracts = contracts.data ?? [];
  const activeContract = allContracts.find(
    (c) => c.status === ContractStatus.ACTIVE,
  );
  const fileIds = (images.data ?? []).map((file) => file.id);

  const renderBody = () => {
    if (room.isLoading) return <RoomDetailSkeleton />;
    if (room.isError && !room.data) {
      return (
        <View style={styles.content}>
          <SectionError
            message="Không tải được thông tin phòng"
            onRetry={room.retry}
          />
        </View>
      );
    }
    if (!room.data) return null;

    return (
      <ScrollView
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
        <View
          style={[
            styles.sections,
            { opacity: room.isFetching && !isRefreshing ? 0.6 : 1 },
          ]}
        >
          <RoomInfoCard room={room.data} fileIds={fileIds} />

          {contracts.isLoading ? (
            <SkeletonBlock height={140} radius={uiRadius.card} />
          ) : contracts.isError && !contracts.data ? (
            <SectionError
              message="Không tải được hợp đồng"
              onRetry={contracts.retry}
            />
          ) : (
            <>
              {activeContract && (
                <>
                  <CurrentContractCard
                    contract={activeContract}
                    onPress={() => handlePressContract(activeContract)}
                  />
                  <CurrentResidentsCard contract={activeContract} scroll />
                </>
              )}
              <ContractHistoryList
                roomId={roomId}
                onPressItem={handlePressContract}
              />
            </>
          )}
          <RoomInvoiceList
            roomId={roomId}
            onPressItem={(invoice) =>
              navigation.navigate("InvoiceDetail", { invoiceId: invoice.id })
            }
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView edges={[]} style={styles.container}>
      <ScreenHeader
        title="Chi tiết phòng"
        onBack={() => navigation.goBack()}
        insetTop
        action={
          roomData ? (
            <IconButton
              icon="create-outline"
              accessibilityLabel="Sửa phòng"
              onPress={() =>
                navigation.navigate("UpdateRoom", { roomId, room: roomData })
              }
            />
          ) : undefined
        }
      />
      {renderBody()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: uiColors.canvas,
  },
  content: {
    padding: uiSpace.screen,
    paddingBottom: 40,
    gap: uiSpace.gap,
  },
  sections: {
    gap: uiSpace.gap,
  },
  cardGap: {
    gap: 14,
  },
  flex: {
    flex: 1,
  },
  imageRow: {
    gap: 12,
  },
  image: {
    width: 180,
    height: 120,
    borderRadius: uiRadius.icon,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  price: {
    ...uiType.bodyStrong,
    color: tokens.colors.primary,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowGap: {
    gap: 4,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  link: {
    ...uiType.bodyStrong,
    color: tokens.colors.primary,
  },
  historyTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

export default RoomDetailScreen;
