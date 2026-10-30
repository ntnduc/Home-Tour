/**
 * EDIT PROFILE SCREEN — fullName + email in a FormSection, sticky save button.
 * States: loading profile → skeleton fields · error → SectionError · saving → button spinner ·
 * server errors (e.g. duplicate email) → Toast from the hook, form stays editable.
 */
import ActionButtonBottom from "@/components/ActionButtonBottom";
import FormScreen from "@/components/FormScreen";
import FormSection from "@/components/FormSection";
import Input from "@/components/Input";
import SectionError from "@/components/SectionError";
import SkeletonBlock from "@/components/SkeletonBlock";
import { RootStackParamList } from "@/navigation/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { useProfileData } from "./hooks/useProfileData";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface EditProfileForm {
  fullName: string;
  email: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, isLoading, isError, retry, updateProfile, isUpdating } = useProfileData();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditProfileForm>({ defaultValues: { fullName: "", email: "" } });

  useEffect(() => {
    if (profile) reset({ fullName: profile.fullName, email: profile.email ?? "" });
  }, [profile, reset]);

  const onSubmit = handleSubmit(async ({ fullName, email }) => {
    try {
      await updateProfile({ fullName: fullName.trim(), email: email.trim() || null });
      navigation.goBack();
    } catch {
      // Toast already shown by the hook; keep the form open.
    }
  });

  if (isError) {
    return (
      <FormScreen>
        <SectionError onRetry={retry} message="Không tải được thông tin cá nhân" />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      footer={
        <ActionButtonBottom
          actions={[
            {
              label: "Lưu thay đổi",
              icon: "checkmark",
              onPress: onSubmit,
              isLoading: isUpdating,
              disabled: !profile || !isDirty,
            },
          ]}
        />
      }
    >
      <FormSection title="Thông tin cá nhân" icon="person-outline">
        {isLoading && !profile ? (
          <View style={{ gap: 12 }}>
            <SkeletonBlock height={52} radius={16} />
            <SkeletonBlock height={52} radius={16} />
          </View>
        ) : (
          <>
            <Controller
              control={control}
              name="fullName"
              rules={{
                validate: (value) =>
                  value.trim().length === 0
                    ? "Họ tên không được để trống"
                    : value.trim().length > 100
                      ? "Họ tên tối đa 100 ký tự"
                      : true,
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Họ tên"
                  required
                  icon="person-outline"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Nhập họ tên"
                  error={errors.fullName?.message}
                />
              )}
            />
            <Input label="Số điện thoại" icon="call-outline" value={profile?.phone} disabled />
            <Controller
              control={control}
              name="email"
              rules={{
                validate: (value) =>
                  !value.trim() || EMAIL_PATTERN.test(value.trim()) ? true : "Email không hợp lệ",
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Email"
                  icon="mail-outline"
                  value={value}
                  onChangeText={onChange}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />
          </>
        )}
      </FormSection>
    </FormScreen>
  );
};

export default EditProfileScreen;
