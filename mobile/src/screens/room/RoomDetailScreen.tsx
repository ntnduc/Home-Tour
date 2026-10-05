import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { tokens } from "@/theme";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
  Contract,
  CONTRACT_STATUS_COLOR,
  CONTRACT_STATUS_LABEL,
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

// Carousel ảnh phòng
const RoomImageCarousel = ({ images }: { images: string[] }) => (
  <FlatList
    data={images}
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={(_, idx) => idx.toString()}
    renderItem={({ item }) => (
      <Image
        source={{ uri: item }}
        style={{ width: 180, height: 120, borderRadius: 12, marginRight: 12 }}
      />
    )}
    style={{ marginBottom: 12 }}
  />
);

// Component hiển thị thông tin phòng nâng cao
const RoomInfoCard = ({ room }: { room: typeof mockRoom }) => (
  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
    <RoomImageCarousel images={room.images} />
    <Text className="text-xl font-bold text-gray-900 mb-1">
      {room.name} ({room.code})
    </Text>
    <View className="flex-row flex-wrap mb-2">
      <Text className="text-sm text-gray-600 mr-4">Tầng: {room.floor}</Text>
      <Text className="text-sm text-gray-600 mr-4">Loại: {room.type}</Text>
      <Text className="text-sm text-gray-600 mr-4">
        Diện tích: {room.area}m²
      </Text>
      <Text className="text-sm text-gray-600">
        Giá: {room.price.toLocaleString()}đ/tháng
      </Text>
    </View>
    <View className="flex-row flex-wrap mb-2">
      <Text className="text-sm text-gray-600 mr-4">
        Số người tối đa: {room.maxPeople}
      </Text>
      <Text className="text-sm text-gray-600 mr-4">
        Vệ sinh: {room.cleaningStatus}
      </Text>
      {room.status === "AVAILABLE" && (
        <Text className="text-sm text-gray-600">
          Sẵn sàng từ: {formatDate(room.availableDate)}
        </Text>
      )}
    </View>
    <View className="flex-row items-center mt-1 mb-2">
      <View
        className="px-3 py-1 rounded-full mr-2"
        style={{
          backgroundColor: room.status === "RENTED" ? tokens.colors.errorSurface : tokens.colors.successSurface,
        }}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: room.status === "RENTED" ? tokens.colors.error : tokens.colors.success }}
        >
          {room.status === "RENTED" ? "Đã thuê" : "Đang trống"}
        </Text>
      </View>
    </View>
    <View className="flex-row flex-wrap items-center mb-2">
      {room.utilities.map((u, idx) => (
        <View key={idx} className="flex-row items-center mr-4 mb-1">
          {u.icon}
          <Text className="text-xs text-gray-700 ml-1">{u.name}</Text>
        </View>
      ))}
    </View>
    {room.note && (
      <View className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded mt-2">
        <Text className="text-xs text-yellow-800">Ghi chú: {room.note}</Text>
      </View>
    )}
    <View className="flex-row items-center mt-3">
      <QRCode value={room.qrCode} size={60} />
      <Text className="ml-3 text-xs text-gray-500">
        QR phòng: Quét để check-in/check-out hoặc chia sẻ nhanh
      </Text>
    </View>
  </View>
);

// Component hiển thị hợp đồng hiện tại
const CurrentContractCard = ({
  contract,
  onPress,
}: {
  contract: Contract;
  onPress: () => void;
}) => (
  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
    <Text className="text-lg font-bold text-gray-900 mb-2">
      Hợp đồng hiện tại
    </Text>
    <View className="mb-2">
      <Text className="text-base font-medium text-gray-900">
        {contract.tenantName}
      </Text>
      <Text className="text-sm text-gray-600">SĐT: {contract.tenantPhone}</Text>
      <Text className="text-sm text-gray-600">
        Thời gian: {formatDate(contract.startDate)} -{" "}
        {formatDate(contract.endDate)}
      </Text>
      <Text className="text-sm text-gray-600">
        Giá thuê: {contract.monthlyRent.toLocaleString()}đ/tháng
      </Text>
      <View
        className="px-3 py-1 rounded-full mt-2 self-start"
        style={{ backgroundColor: CONTRACT_STATUS_COLOR[contract.status].bg }}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: CONTRACT_STATUS_COLOR[contract.status].color }}
        >
          {CONTRACT_STATUS_LABEL[contract.status]}
        </Text>
      </View>
    </View>
    <TouchableOpacity
      className="flex-row items-center mt-2"
      style={{ alignSelf: "flex-start" }}
      onPress={onPress}
    >
      <Ionicons
        name="document-text-outline"
        size={18}
        color={tokens.colors.primary}
        style={{ marginRight: 4 }}
      />
      <Text className="text-sm font-semibold text-primary">
        Xem chi tiết hợp đồng
      </Text>
    </TouchableOpacity>
  </View>
);

// Component hiển thị danh sách người ở hiện tại
const CurrentResidentsCard = ({
  residents,
}: {
  residents: { name: string; phone: string; relation: string }[];
}) => (
  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
    <Text className="text-lg font-bold text-gray-900 mb-2">
      Người ở hiện tại ({residents.length})
    </Text>
    {residents.map((r, idx) => (
      <View key={idx} className="flex-row items-center mb-2">
        <Ionicons
          name="person-circle-outline"
          size={20}
          color={tokens.colors.primary}
          style={{ marginRight: 6 }}
        />
        <View>
          <Text className="text-base text-gray-900 font-medium">
            {r.name}{" "}
            <Text className="text-xs text-gray-500">({r.relation})</Text>
          </Text>
          <Text className="text-xs text-gray-600">SĐT: {r.phone}</Text>
        </View>
      </View>
    ))}
  </View>
);

// Component hiển thị lịch sử vi phạm
const ViolationHistoryCard = ({
  violations,
}: {
  violations: { date: string; content: string }[];
}) => (
  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
    <Text className="text-lg font-bold text-gray-900 mb-2">
      Lịch sử vi phạm
    </Text>
    {violations.length === 0 ? (
      <Text className="text-sm text-gray-500">
        Không có vi phạm nào được ghi nhận.
      </Text>
    ) : (
      violations.map((v, idx) => (
        <View key={idx} className="mb-2 flex-row items-start">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={18}
            color={tokens.palette.amber[500]}
            style={{ marginRight: 6, marginTop: 2 }}
          />
          <View>
            <Text className="text-xs text-gray-600 mb-1">
              {formatDate(v.date)}
            </Text>
            <Text className="text-sm text-gray-800">{v.content}</Text>
          </View>
        </View>
      ))
    )}
  </View>
);

// Component hiển thị danh sách hợp đồng lịch sử
const ContractHistoryList = ({
  contracts,
  onPressItem,
}: {
  contracts: Contract[];
  onPressItem: (contract: Contract) => void;
}) => (
  <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
    <Text className="text-lg font-bold text-gray-900 mb-2">
      Lịch sử hợp đồng
    </Text>
    {contracts.length === 0 ? (
      <Text className="text-sm text-gray-500">
        Chưa có hợp đồng nào trong quá khứ.
      </Text>
    ) : (
      contracts.map((contract) => (
        <TouchableOpacity
          key={contract.id}
          className="flex-row items-center justify-between py-2 border-b border-gray-100"
          onPress={() => onPressItem(contract)}
        >
          <View>
            <Text className="text-base font-medium text-gray-900">
              {contract.tenantName}
            </Text>
            <Text className="text-xs text-gray-600">
              {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
            </Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: CONTRACT_STATUS_COLOR[contract.status].bg,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: CONTRACT_STATUS_COLOR[contract.status].color }}
            >
              {CONTRACT_STATUS_LABEL[contract.status]}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={tokens.colors.subtle}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      ))
    )}
  </View>
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
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-4 py-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Thông tin phòng nâng cao */}
        <RoomInfoCard room={mockRoom} />

        {/* Hợp đồng hiện tại */}
        {mockRoom.status === "RENTED" && mockCurrentContract && (
          <CurrentContractCard
            contract={mockCurrentContract}
            onPress={() => handlePressContract(mockCurrentContract)}
          />
        )}

        {/* Người ở hiện tại */}
        {mockRoom.status === "RENTED" && (
          <CurrentResidentsCard residents={mockCurrentResidents} />
        )}

        {/* Lịch sử vi phạm */}
        {mockRoom.status === "RENTED" && (
          <ViolationHistoryCard violations={mockViolations} />
        )}

        {/* Lịch sử hợp đồng */}
        <ContractHistoryList
          contracts={mockContractHistory}
          onPressItem={handlePressContract}
        />
      </ScrollView>
    </View>
  );
};

export default RoomDetailScreen;
