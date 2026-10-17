import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Chip from "@/components/Chip";
import FormSection from "@/components/FormSection";
import IconSquircle from "@/components/IconSquircle";
import ListRow from "@/components/ListRow";
import NoticeBanner from "@/components/NoticeBanner";
import StatusBadge from "@/components/StatusBadge";
import { tokens, uiColors, uiRadius, uiSpace, uiType } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
  Contract,
  CONTRACT_STATUS_BADGE,
  ContractStatus,
} from "../../types/contract";

// Mock data cho phòng và hợp đồng
const mockRoom = {
  id: 101,
  name: "Phòng 101",
  code: "A101",
  area: 25,
  price: 5000000,
  maxPeople: 3,
  floor: 2,
  type: "Studio",
  cleaningStatus: "Đã dọn dẹp", // "Đã dọn dẹp" | "Chưa dọn" | "Sắp đến lịch dọn"
  availableDate: "2024-07-01",
  note: "Cần kiểm tra lại vòi nước.",
  utilities: [
    { name: "Wifi", icon: <Feather name="wifi" size={18} color={tokens.colors.primary} /> },
    {
      name: "Máy lạnh",
      icon: <Feather name="wind" size={18} color={tokens.colors.primary} />,
    },
    {
      name: "WC riêng",
      icon: <MaterialCommunityIcons name="toilet" size={18} color={tokens.colors.primary} />,
    },
    {
      name: "Tủ lạnh",
      icon: (
        <MaterialCommunityIcons
          name="fridge-outline"
          size={18}
          color={tokens.colors.primary}
        />
      ),
    },
    {
      name: "Giường",
      icon: <FontAwesome5 name="bed" size={18} color={tokens.colors.primary} />,
    },
    {
      name: "Ban công",
      icon: <MaterialCommunityIcons name="balcony" size={18} color={tokens.colors.primary} />,
    },
  ],
  status: "RENTED", // "RENTED" | "AVAILABLE"
  images: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80",
  ],
  qrCode: "ROOM-101-A101",
};

const mockCurrentContract: Contract | null = {
  id: 12,
  roomId: 101,
  roomName: "Phòng 101",
  buildingName: "Chung cư A",
  tenantName: "Nguyễn Văn A",
  tenantPhone: "0909123456",
  tenantEmail: "vana@gmail.com",
  tenantIdCard: "123456789",
  tenantAddress: "123 Lê Lợi, Q.1, TP.HCM",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  monthlyRent: 5000000,
  deposit: 10000000,
  status: ContractStatus.ACTIVE,
  createdAt: "2024-01-01",
  services: [],
};

const mockContractHistory: Contract[] = [
  {
    id: 11,
    roomId: 101,
    roomName: "Phòng 101",
    buildingName: "Chung cư A",
    tenantName: "Trần Thị B",
    tenantPhone: "0909888777",
    tenantEmail: "b@gmail.com",
    tenantIdCard: "987654321",
    tenantAddress: "456 Nguyễn Huệ, Q.1, TP.HCM",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    monthlyRent: 4800000,
    deposit: 9000000,
    status: ContractStatus.TERMINATED,
    createdAt: "2023-01-01",
    terminatedAt: "2023-12-31",
    services: [],
  },
  {
    id: 10,
    roomId: 101,
    roomName: "Phòng 101",
    buildingName: "Chung cư A",
    tenantName: "Lê Văn C",
    tenantPhone: "0909555666",
    tenantEmail: "c@gmail.com",
    tenantIdCard: "192837465",
    tenantAddress: "789 Trần Hưng Đạo, Q.5, TP.HCM",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    monthlyRent: 4700000,
    deposit: 8000000,
    status: ContractStatus.TERMINATED,
    createdAt: "2022-01-01",
    terminatedAt: "2022-12-31",
    services: [],
  },
];

// Mock danh sách người ở hiện tại
const mockCurrentResidents = [
  { name: "Nguyễn Văn A", phone: "0909123456", relation: "Chủ hợp đồng" },
  { name: "Nguyễn Thị D", phone: "0909777888", relation: "Vợ" },
  { name: "Nguyễn Văn E", phone: "0909666555", relation: "Con trai" },
];

// Mock lịch sử vi phạm
const mockViolations = [
  { date: "2024-03-15", content: "Để xe sai quy định tại hành lang." },
  { date: "2024-05-02", content: "Gây ồn ào sau 22h." },
];

/** Contract status → StatusBadge (falls back to neutral for unknown statuses). */
const ContractBadge = ({ status }: { status: ContractStatus }) => {
  const badge = CONTRACT_STATUS_BADGE[status] ?? { label: String(status), tone: "neutral" as const };
  return <StatusBadge size="sm" label={badge.label} tone={badge.tone} />;
};

// Carousel ảnh phòng
const RoomImageCarousel = ({ images }: { images: string[] }) => (
  <FlatList
    data={images}
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={(_, idx) => idx.toString()}
    renderItem={({ item }) => <Image source={{ uri: item }} style={styles.image} />}
    contentContainerStyle={styles.imageRow}
  />
);

// Thông tin phòng
const RoomInfoCard = ({ room }: { room: typeof mockRoom }) => (
  <Card style={styles.cardGap}>
    <RoomImageCarousel images={room.images} />
    <View style={styles.titleRow}>
      <View style={styles.flex}>
        <Text style={uiType.section}>
          {room.name} ({room.code})
        </Text>
        <Text style={styles.price}>{room.price.toLocaleString()}đ/tháng</Text>
      </View>
      <StatusBadge
        label={room.status === "RENTED" ? "Đã thuê" : "Đang trống"}
        tone={room.status === "RENTED" ? "success" : "info"}
      />
    </View>
    <View style={styles.chipWrap}>
      <Chip icon="layers-outline" label={`Tầng ${room.floor}`} />
      <Chip icon="grid-outline" label={room.type} />
      <Chip icon="resize-outline" label={`${room.area}m²`} />
      <Chip icon="people-outline" label={`Tối đa ${room.maxPeople} người`} />
      <Chip icon="sparkles-outline" label={room.cleaningStatus} />
      {room.status === "AVAILABLE" && (
        <Chip icon="calendar-outline" label={`Trống từ ${formatDate(room.availableDate)}`} />
      )}
    </View>
    <View style={styles.utilities}>
      {room.utilities.map((u, idx) => (
        <View key={idx} style={styles.utility}>
          {u.icon}
          <Text style={uiType.caption}>{u.name}</Text>
        </View>
      ))}
    </View>
    {room.note && <NoticeBanner tone="warning" title="Ghi chú" message={room.note} />}
    <View style={styles.qrRow}>
      <QRCode value={room.qrCode} size={60} />
      <Text style={[uiType.caption, styles.flex]}>
        QR phòng: Quét để check-in/check-out hoặc chia sẻ nhanh
      </Text>
    </View>
  </Card>
);

// Hợp đồng hiện tại
const CurrentContractCard = ({
  contract,
  onPress,
}: {
  contract: Contract;
  onPress: () => void;
}) => (
  <FormSection
    title="Hợp đồng hiện tại"
    icon="document-text-outline"
    action={<ContractBadge status={contract.status} />}
  >
    <View style={styles.rowGap}>
      <Text style={uiType.bodyStrong}>{contract.tenantName}</Text>
      <Text style={uiType.caption}>SĐT: {contract.tenantPhone}</Text>
      <Text style={uiType.caption}>
        Thời gian: {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
      </Text>
      <Text style={uiType.caption}>
        Giá thuê: {contract.monthlyRent.toLocaleString()}đ/tháng
      </Text>
    </View>
    <Button
      label="Xem chi tiết hợp đồng"
      icon="document-text-outline"
      variant="soft"
      size="sm"
      onPress={onPress}
      style={styles.selfStart}
    />
  </FormSection>
);

// Người ở hiện tại
const CurrentResidentsCard = ({
  residents,
}: {
  residents: { name: string; phone: string; relation: string }[];
}) => (
  <FormSection title={`Người ở hiện tại (${residents.length})`} icon="people-outline">
    <View style={styles.bleedList}>
      {residents.map((r, idx) => (
        <ListRow
          key={idx}
          divider={idx > 0}
          icon="person-outline"
          title={`${r.name} · ${r.relation}`}
          subtitle={`SĐT: ${r.phone}`}
        />
      ))}
    </View>
  </FormSection>
);

// Lịch sử vi phạm
const ViolationHistoryCard = ({
  violations,
}: {
  violations: { date: string; content: string }[];
}) => (
  <FormSection title="Lịch sử vi phạm" icon="alert-circle-outline" iconTone="warning">
    {violations.length === 0 ? (
      <Text style={uiType.caption}>Không có vi phạm nào được ghi nhận.</Text>
    ) : (
      violations.map((v, idx) => (
        <View key={idx} style={styles.violation}>
          <IconSquircle icon="alert-circle-outline" tone="warning" size="sm" />
          <View style={styles.flex}>
            <Text style={uiType.caption}>{formatDate(v.date)}</Text>
            <Text style={uiType.body}>{v.content}</Text>
          </View>
        </View>
      ))
    )}
  </FormSection>
);

// Lịch sử hợp đồng
const ContractHistoryList = ({
  contracts,
  onPressItem,
}: {
  contracts: Contract[];
  onPressItem: (contract: Contract) => void;
}) => (
  <FormSection title="Lịch sử hợp đồng" icon="time-outline">
    {contracts.length === 0 ? (
      <Text style={uiType.caption}>Chưa có hợp đồng nào trong quá khứ.</Text>
    ) : (
      <View style={styles.bleedList}>
        {contracts.map((contract, idx) => (
          <ListRow
            key={contract.id}
            divider={idx > 0}
            title={contract.tenantName}
            subtitle={`${formatDate(contract.startDate)} – ${formatDate(contract.endDate)}`}
            trailing={
              <View style={styles.historyTrailing}>
                <ContractBadge status={contract.status} />
                <Ionicons name="chevron-forward" size={18} color={uiColors.textSubtle} />
              </View>
            }
            onPress={() => onPressItem(contract)}
          />
        ))}
      </View>
    )}
  </FormSection>
);

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

const RoomDetailScreen = () => {
  const navigation = useNavigation<any>();

  // Xử lý khi bấm vào hợp đồng (hiện tại hoặc lịch sử)
  const handlePressContract = (contract: Contract) => {
    navigation.navigate("ContractDetail", { contract });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <RoomInfoCard room={mockRoom} />

      {mockRoom.status === "RENTED" && mockCurrentContract && (
        <CurrentContractCard
          contract={mockCurrentContract}
          onPress={() => handlePressContract(mockCurrentContract)}
        />
      )}

      {mockRoom.status === "RENTED" && <CurrentResidentsCard residents={mockCurrentResidents} />}

      {mockRoom.status === "RENTED" && <ViolationHistoryCard violations={mockViolations} />}

      <ContractHistoryList contracts={mockContractHistory} onPressItem={handlePressContract} />
    </ScrollView>
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
  utilities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  utility: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowGap: {
    gap: 4,
  },
  selfStart: {
    alignSelf: "flex-start",
  },
  bleedList: {
    marginHorizontal: -16,
  },
  violation: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  historyTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

export default RoomDetailScreen;
