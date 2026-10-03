import { ChildStep, ParrentStep } from "@/components/StepByStep";
import { RootStackParamList } from "@/navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Text, View } from "react-native";

type TestScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TestScreen">;
};

/** Giả lập gọi API mất 1.2s rồi thành công. */
const fakeApiCall = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 1200));

const TestScreen = ({}: TestScreenProps) => {
  return (
    <View className="flex-1 bg-white">
      <ParrentStep activeStep={0}>
        <ChildStep
          label="Thông tin"
          nextAction={{
            label: "Tạo hoá đơn",
            variant: "primary",
            // Gọi API, chỉ chuyển bước khi thành công (nút hiển thị loading).
            onPress: fakeApiCall,
          }}
          previousAction={{ label: "Quay lại" }}
        >
          <View className="items-center py-6">
            <Text className="text-base text-gray-700">Nội dung của bước 1</Text>
          </View>
        </ChildStep>

        <ChildStep
          label="Xác nhận"
          nextAction={{ label: "Tiếp tục" }}
          previousAction={{ label: "Quay lại" }}
        >
          <View className="items-center py-6">
            <Text className="text-base text-gray-700">Nội dung của bước 2</Text>
          </View>
        </ChildStep>

        <ChildStep
          label="Hoàn tất"
          previousAction={{ label: "Quay lại" }}
          finishAction={{
            label: "Hoàn tất",
            variant: "success",
            onPress: fakeApiCall,
          }}
        >
          <View className="items-center py-6">
            <Text className="text-base text-gray-700">Nội dung của bước 3</Text>
          </View>
        </ChildStep>
      </ParrentStep>
    </View>
  );
};

export default TestScreen;
