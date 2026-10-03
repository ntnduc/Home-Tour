import CardComponent from "@/screens/common/CardComponent";
import { ClientCreateRequest } from "@/types/client";
import { cn } from "@/utils/appUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type PartnerClientsSectionProps = {
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  data?: ClientCreateRequest[];
  error?: string;
};

const PartnerClientsSection: React.FC<PartnerClientsSectionProps> = ({
  onAdd,
  onEdit,
  onDelete,
  error,
  data,
}) => {
  const hasCompanion = data && data.length > 0;

  return (
    <CardComponent
      className={cn({
        "border border-red-400": error,
      })}
      style={{ borderColor: "#ef4444" }}
      title="Người ở cùng"
      renderActions={() => (
        <TouchableOpacity
          className="flex-row items-center px-3 py-2 rounded-full bg-emerald-50 border border-emerald-200"
          onPress={onAdd}
        >
          <Ionicons name="person-add-outline" size={18} color="#059669" />
          <Text className="ml-2 text-sm font-medium text-emerald-700">
            Thêm người ở cùng
          </Text>
        </TouchableOpacity>
      )}
    >
      {!hasCompanion ? (
        <View className="items-center justify-center py-6">
          <Ionicons name="people-circle-outline" size={40} color="#9CA3AF" />
          <Text className="mt-3 text-sm text-gray-500">
            Chưa thêm người ở cùng nào
          </Text>
          <Text className="text-xs text-gray-400 mt-1 text-center">
            Bạn có thể bỏ qua bước này nếu không có người ở cùng
          </Text>
        </View>
      ) : (
        <View className="flex flex-col gap-3">
          {data.map((client, idx) => {
            return (
              <View
                key={`companion-${idx}`}
                className="p-3 rounded-xl border border-gray-100 bg-gray-50"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-semibold text-gray-900">
                      {client.name}
                    </Text>
                    {client.phoneNumber ? (
                      <Text className="text-xs text-gray-500 mt-1">
                        SĐT: {client.phoneNumber}
                      </Text>
                    ) : null}
                    {client.idCardNumber ? (
                      <Text className="text-xs text-gray-500">
                        CCCD/CMND: {client.idCardNumber}
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => onEdit(idx)}
                      className="px-2 py-1 mr-2 rounded-full bg-blue-50"
                    >
                      <Text className="text-xs font-medium text-blue-600">
                        Cập nhật
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onDelete(idx)}
                      className="px-2 py-1 rounded-full bg-red-50"
                    >
                      <Text className="text-xs font-medium text-red-500">
                        Xóa
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
      {error ? (
        <Text className="text-xs text-red-500 mt-2">{error}</Text>
      ) : null}
    </CardComponent>
  );
};

export default PartnerClientsSection;
