import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { tokens } from "@/theme";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Contract } from "../../types/contract";

type RootStackParamList = {
  TerminateContract: { contract: Contract };
  RoomList: undefined;
};

type TerminateContractScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: { params: { contract: Contract } };
};

const TerminateContractScreen = ({
  navigation,
  route,
}: TerminateContractScreenProps) => {
  const { contract } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!terminationReason.trim()) {
      newErrors.terminationReason = "Lý do kết thúc không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTerminate = async () => {
    if (!validateForm()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do kết thúc hợp đồng");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Gọi API kết thúc hợp đồng
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      Alert.alert("Thành công", "Đã kết thúc hợp đồng thành công!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("RoomList"),
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết thúc hợp đồng");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-4 py-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Header cảnh báo */}
        <View className="bg-red-50 rounded-xl p-4 mb-3 border border-red-200">
          <View className="flex-row items-start">
            <Ionicons
              name="warning"
              size={24}
              color={tokens.colors.error}
              className="mr-3 mt-1"
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-red-800 mb-2">
                Kết thúc hợp đồng
              </Text>
              <Text className="text-sm text-red-700">
                Hành động này sẽ chuyển phòng về trạng thái trống và không thể
                hoàn tác.
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin hợp đồng */}
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Thông tin hợp đồng
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Mã hợp đồng</Text>
              <Text className="text-sm font-semibold text-gray-900">
                #{contract.id}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Phòng</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {contract.roomName} - {contract.buildingName}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Người thuê</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {contract.tenantName}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Thời hạn</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {formatDate(contract.startDate)} -{" "}
                {formatDate(contract.endDate)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Tiền thuê</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {formatCurrency(contract.monthlyRent)}đ/tháng
              </Text>
            </View>
          </View>
        </View>

        {/* Lý do kết thúc */}
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Lý do kết thúc *
          </Text>

          <View
            className={`bg-gray-50 rounded-lg border ${errors.terminationReason ? "border-red-300 bg-red-50" : "border-gray-200"}`}
          >
            <TextInput
              className="p-3 text-base text-gray-900 min-h-[100px]"
              value={terminationReason}
              onChangeText={(value) => {
                setTerminationReason(value);
                if (errors.terminationReason) {
                  setErrors((prev) => ({ ...prev, terminationReason: "" }));
                }
              }}
              placeholder="Nhập lý do kết thúc hợp đồng..."
              placeholderTextColor={tokens.colors.subtle}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          {errors.terminationReason && (
            <Text className="text-xs text-red-500 mt-1 ml-1">
              {errors.terminationReason}
            </Text>
          )}
        </View>

        {/* Thông tin hoàn trả */}
        <View className="bg-info-surface rounded-xl p-4 mb-3 border border-info">
          <Text className="text-lg font-bold text-info mb-4">
            Thông tin hoàn trả
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-info">Tiền cọc</Text>
              <Text className="text-sm font-semibold text-info">
                {formatCurrency(contract.deposit)}đ
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-info">Dịch vụ đã trả</Text>
              <Text className="text-sm font-semibold text-info">
                {formatCurrency(
                  contract.services
                    .filter((service) => service.isIncluded)
                    .reduce((sum, service) => sum + service.price, 0)
                )}
                đ
              </Text>
            </View>

            <View className="border-t border-info pt-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-semibold text-info">
                  Tổng hoàn trả
                </Text>
                <Text className="text-lg font-bold text-info">
                  {formatCurrency(
                    contract.deposit +
                      contract.services
                        .filter((service) => service.isIncluded)
                        .reduce((sum, service) => sum + service.price, 0)
                  )}
                  đ
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-3 p-3 bg-info-surface rounded-lg">
            <Text className="text-xs text-info">
              💡 Lưu ý: Số tiền hoàn trả sẽ được tính toán dựa trên thời gian sử
              dụng thực tế và tình trạng phòng.
            </Text>
          </View>
        </View>

        {/* Các lý do phổ biến */}
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Lý do phổ biến
          </Text>

          <View className="space-y-2">
            {[
              "Hết hạn hợp đồng",
              "Người thuê tự ý chấm dứt",
              "Vi phạm quy định thuê",
              "Bảo trì, sửa chữa phòng",
              "Thay đổi mục đích sử dụng",
              "Khác",
            ].map((reason, index) => (
              <TouchableOpacity
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                onPress={() => setTerminationReason(reason)}
              >
                <Text className="text-sm text-gray-700">{reason}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-red-500 items-center justify-center shadow-lg"
          onPress={handleTerminate}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Ionicons name="checkmark" size={28} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        className="absolute top-16 left-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-md"
        onPress={() => navigation.goBack()}
        disabled={isLoading}
      >
        <Ionicons name="arrow-back" size={20} color={tokens.colors.foreground} />
      </TouchableOpacity>
    </View>
  );
};

export default TerminateContractScreen;
