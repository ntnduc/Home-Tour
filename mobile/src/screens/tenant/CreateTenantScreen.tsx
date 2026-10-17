import ActionButtonBottom from "@/components/ActionButtonBottom";
import FormScreen from "@/components/FormScreen";
import FormSection from "@/components/FormSection";
import InputBase from "@/components/Input";
import Loading from "@/components/Loading";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../../navigation/types";

// Placeholder tenant type - should be defined in types
interface TenantCreateRequest {
  name: string;
  email: string;
  phone: string;
  identityNumber: string;
  address: string;
  roomId?: string;
}

type CreateTenantScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CreateTenant">;
  route: RouteProp<RootStackParamList, "CreateTenant">;
};

const CreateTenantScreen = ({ navigation, route }: CreateTenantScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { roomId } = route.params || {};

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantCreateRequest>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      identityNumber: "",
      address: "",
      roomId: roomId,
    },
  });

  const onSubmit = (data: TenantCreateRequest) => {
    setIsLoading(true);

    // TODO: Implement actual API call
    setTimeout(() => {
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Tạo khách thuê thành công",
      });
      navigation.goBack();
      setIsLoading(false);
    }, 1000);
  };

  const onError = (errors: FieldErrors<TenantCreateRequest>) => {
    Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FormScreen
      footer={
        <ActionButtonBottom
          actions={[
            {
              label: "Tạo khách thuê",
              onPress: handleSubmit(onSubmit, onError),
              variant: "primary",
              isLoading: isLoading,
              icon: "checkmark-circle",
            },
          ]}
        />
      }
    >
      <FormSection title="Thông tin cá nhân" icon="person-outline">
          <Controller
            control={control}
            name="name"
            rules={{ required: "Vui lòng nhập họ tên" }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                placeholder="Nhập họ tên đầy đủ"
                value={value}
                onChangeText={onChange}
                label="Họ và tên"
                required={true}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: "Vui lòng nhập email",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email không hợp lệ",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                placeholder="Nhập địa chỉ email"
                value={value}
                onChangeText={onChange}
                label="Email"
                required={true}
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            rules={{
              required: "Vui lòng nhập số điện thoại",
              pattern: {
                value: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                placeholder="Nhập số điện thoại"
                value={value}
                onChangeText={onChange}
                label="Số điện thoại"
                required={true}
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="identityNumber"
            rules={{
              required: "Vui lòng nhập CCCD/CMND",
              pattern: {
                value: /^[0-9]{9,12}$/,
                message: "CCCD/CMND không hợp lệ",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                placeholder="Nhập số CCCD/CMND"
                value={value}
                onChangeText={onChange}
                label="CCCD/CMND"
                required={true}
                keyboardType="numeric"
                error={errors.identityNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            rules={{ required: "Vui lòng nhập địa chỉ" }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                placeholder="Nhập địa chỉ thường trú"
                value={value}
                onChangeText={onChange}
                required={true}
                type="area"
                numberOfLines={3}
                label="Địa chỉ thường trú"
                error={errors.address?.message}
              />
            )}
          />
      </FormSection>
    </FormScreen>
  );
};

export default CreateTenantScreen;
