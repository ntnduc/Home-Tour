import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

type PropertyDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "PropertyDetail">;
  route: RouteProp<RootStackParamList, "PropertyDetail">;
};

const PropertyDetailScreen = ({
  navigation,
  route,
}: PropertyDetailScreenProps) => {
  const { propertyId } = route.params;

  const handleViewRooms = () => {
    navigation.navigate("RoomList", { propertyId });
  };

  const handleCreateRoom = () => {
    navigation.navigate("CreateRoom", { propertyId });
  };

  const handleEditProperty = () => {
    navigation.navigate("UpdateProperty", { propertyId });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Chi Tiết Tài Sản
          </Text>
          <TouchableOpacity
            onPress={handleEditProperty}
            className="p-2 bg-primary-muted rounded-full"
          >
            <Ionicons name="pencil" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Thông Tin Cơ Bản
          </Text>
          {/* Property details will be loaded here */}
          <Text className="text-sm text-gray-500">
            Property ID: {propertyId}
          </Text>
        </View>

        <View className="mt-6 space-y-3">
          <TouchableOpacity
            className="bg-primary flex-row items-center justify-center p-4 rounded-xl"
            onPress={handleViewRooms}
          >
            <Ionicons name="list" size={20} color="white" />
            <Text className="text-white text-base font-semibold ml-2">
              Xem Danh Sách Phòng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-600 flex-row items-center justify-center p-4 rounded-xl"
            onPress={handleCreateRoom}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white text-base font-semibold ml-2">
              Thêm Phòng Mới
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles moved to Tailwind classes

export default PropertyDetailScreen;
