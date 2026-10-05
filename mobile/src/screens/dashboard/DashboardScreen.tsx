import { tokens } from "@/theme";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatCard from "../../components/StatCard";
import { User } from "../../types/user";
import { getStoreUser } from "../../utils/appUtil";

type RootStackParamList = {
  Login: undefined;
  OTPVerification: { phoneNumber: string };
  Register: { registrationToken: string };
  MainTabs: undefined;
  RoomList: undefined;
  RoomDetail: { roomId: string };
  CreateTenant: undefined;
  UpdateRoom: { room: any };
  InvoiceDetail: { invoice: any; fromHistory?: boolean };
  InvoiceHistory: undefined;
  CreateContract: { room: any };
  ContractDetail: { contract: any };
  ContractList: undefined;
  TerminateContract: { contract: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DashboardScreen = () => {
  const [user, setUser] = React.useState<User | undefined>(undefined);
  const navigation = useNavigation<NavigationProp>();

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await getStoreUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  const quickActions = [
    {
      id: 1,
      title: "Quản lý phòng",
      description: "Xem và quản lý danh sách phòng",
      icon: "business-outline",
      color: tokens.colors.primary,
      onPress: () => navigation.navigate("RoomList"),
    },
    {
      id: 2,
      title: "Hợp đồng",
      description: "Xem và quản lý hợp đồng thuê phòng",
      icon: "document-text-outline",
      color: tokens.colors.success,
      onPress: () => navigation.navigate("ContractList"),
    },
    {
      id: 3,
      title: "Lịch sử hóa đơn",
      description: "Xem lịch sử thanh toán",
      icon: "time-outline",
      color: tokens.palette.amber[500],
      onPress: () => navigation.navigate("InvoiceHistory"),
    },
    {
      id: 4,
      title: "Báo cáo",
      description: "Xem báo cáo thống kê",
      icon: "bar-chart-outline",
      color: "#AF52DE",
      onPress: () => {
        // TODO: Navigate to report screen
        console.log("Navigate to report");
      },
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trang chủ</Text>
          <Text style={styles.subtitle}>Xin chào, {user?.fullName}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon={<Ionicons name="business" size={28} color={tokens.colors.primary} />}
            label="Tài sản"
            value={0}
            bgColor={tokens.colors.primaryMuted}
          />
          <StatCard
            icon={
              <MaterialIcons name="meeting-room" size={28} color="#00c2ff" />
            }
            label="Tổng phòng"
            value={0}
            bgColor="#e6f9f3"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon={
              <FontAwesome5 name="user-friends" size={28} color="#ff4d6d" />
            }
            label="Đã thuê"
            value={0}
            bgColor="#fff3f0"
          />
          <StatCard
            icon={<Ionicons name="cash" size={28} color="#00c2ff" />}
            label="Tháng này"
            value="0₫"
            bgColor="#fbefff"
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.quickActionTitle}>Thao tác nhanh</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionContent}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}20` },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitleText}>
                    {action.title}
                  </Text>
                  <Text style={styles.quickActionDescription}>
                    {action.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={tokens.colors.muted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activities */}
        <Text style={styles.recentTitle}>Hoạt động gần đây</Text>
        <View style={styles.recentBox}>
          <View style={styles.recentActivities}>
            <View style={styles.recentActivity}>
              <View
                style={[styles.activityDot, { backgroundColor: tokens.colors.success }]}
              />
              <Text style={styles.activityText}>
                Hợp đồng mới được tạo cho Phòng 101
              </Text>
              <Text style={styles.activityTime}>2 giờ trước</Text>
            </View>
            <View style={styles.recentActivity}>
              <View
                style={[styles.activityDot, { backgroundColor: tokens.colors.primary }]}
              />
              <Text style={styles.activityText}>
                Thanh toán hóa đơn tháng 1/2024
              </Text>
              <Text style={styles.activityTime}>1 ngày trước</Text>
            </View>
            <View style={styles.recentActivity}>
              <View
                style={[styles.activityDot, { backgroundColor: tokens.palette.amber[500] }]}
              />
              <Text style={styles.activityText}>
                Cập nhật thông tin Phòng 202
              </Text>
              <Text style={styles.activityTime}>2 ngày trước</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: tokens.colors.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: tokens.colors.muted,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quickActionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: tokens.colors.foreground,
    marginTop: 24,
    marginBottom: 16,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceMuted,
  },
  quickActionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitleText: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colors.foreground,
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 14,
    color: tokens.colors.muted,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: tokens.colors.foreground,
    marginBottom: 16,
  },
  recentBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceMuted,
  },
  recentActivities: {
    gap: 12,
  },
  recentActivity: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.foreground,
  },
  activityTime: {
    fontSize: 12,
    color: tokens.colors.subtle,
  },
});

export default DashboardScreen;
