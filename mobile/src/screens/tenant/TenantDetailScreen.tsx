import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

type TenantDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TenantDetail">;
  route: RouteProp<RootStackParamList, "TenantDetail">;
};

const TenantDetailScreen = ({ navigation, route }: TenantDetailScreenProps) => {
  const { tenantId } = route.params;

  const handleEditTenant = () => {
    navigation.navigate("UpdateTenant", { tenantId });
  };

  const handleCreateContract = () => {
    navigation.navigate("CreateContract", { roomId: "", tenantId });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Chi Tiết Khách Thuê
          </Text>
          <TouchableOpacity
            onPress={handleEditTenant}
            className="p-2 bg-primary-muted rounded-full"
          >
            <Ionicons name="pencil" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Thông Tin Cá Nhân
          </Text>
          <Text className="text-sm text-gray-500">Tenant ID: {tenantId}</Text>
        </View>

        <View className="mt-6">
          <TouchableOpacity
            className="bg-primary flex-row items-center justify-center p-4 rounded-xl"
            onPress={handleCreateContract}
          >
            <Ionicons name="document-text" size={20} color="white" />
            <Text className="text-white text-base font-semibold ml-2">
              Tạo Hợp Đồng
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles moved to Tailwind classes

export default TenantDetailScreen;
