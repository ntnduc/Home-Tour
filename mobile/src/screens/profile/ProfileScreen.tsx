import { logout } from "@/api/auth/api";
import ButtonAction from "@/components/ButtomAction";
import { User } from "@/types/user";
import { getStoreUser } from "@/utils/appUtil";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Alert, Text, View } from "react-native";
import { Avatar } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";

type RootStackParamList = {
  Login: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = React.useState<User | undefined>(undefined);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getStoreUser();
    setUser(userData);
  };

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            //
          }
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, display: "flex" }}>
      <View className="p-4 gap-4">
        {/* Header */}
        <View className="bg-[rgba(0,0,0,0.03)] p-4 rounded-lg gap-4">
          <View className="flex-row justify-center">
            <Avatar />
          </View>
          <View className="gap-2 items-center">
            <Text className="text-xl font-bold text-primary">
              {user?.fullName || "Chưa cập nhật"}
            </Text>
            <Text className="text-foreground-muted">
              {user?.phoneNumber || "Chưa cập nhật"}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="gap-2">
          <Text className="text-gray-500">Thông tin cá nhân</Text>

          <ButtonAction
            icon="person-outline"
            onPress={() => {}}
            text="Cài đặt"
          />

          <ButtonAction
            icon={"help-circle-outline"}
            onPress={() => {}}
            text="Trợ giúp"
          ></ButtonAction>

          <ButtonAction
            icon="log-out-outline"
            onPress={handleLogout}
            type="danger"
            text="Đăng xuất"
          />
        </View>

        {/* App Info */}
        <View className="items-center p-4"></View>
        <Text className=" text-center text-gray-500">Phiên bản @1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
