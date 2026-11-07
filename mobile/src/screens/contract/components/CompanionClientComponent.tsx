import ActionButtonBottom from "@/components/ActionButtonBottom";
import AppSheet, { AppSheetRef } from "@/components/AppSheet/AppSheet";
import AppSheetScrollView, {
  SHEET_FOOTER_CLEARANCE,
} from "@/components/AppSheet/AppSheetScrollView";
import Input from "@/components/Input";
import NoticeBanner from "@/components/NoticeBanner";
import { uiSpace } from "@/theme";
import { ClientCreateRequest } from "@/types/client";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

interface CompanionClientComponentProps {
  onSuccess?: (client: ClientCreateRequest, index: number) => void;
}

export interface CompanionClientComponentRef {
  close: () => void;
  expand: (client: ClientCreateRequest, index: number) => void;
}

const CompanionClientComponent = forwardRef<
  CompanionClientComponentRef,
  CompanionClientComponentProps
>(({ onSuccess }, ref) => {
  const bottomSheetRef = useRef<AppSheetRef>(null);
  const [index, setIndex] = useState<number>(0);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClientCreateRequest>({
    defaultValues: {
      name: "",
      phoneNumber: "",
      isLandlordClient: false,
      isActive: true,
    },
  });

  useImperativeHandle(ref, () => ({
    close: () => {
      bottomSheetRef.current?.close();
    },
    expand: (client: ClientCreateRequest, idx: number) => {
      setIndex(idx);
      reset({
        name: client?.name || "",
        phoneNumber: client?.phoneNumber || "",
        idCardNumber: client?.idCardNumber,
        permanentAddress: client?.permanentAddress,
        isLandlordClient: false,
        isActive: true,
      });

      bottomSheetRef.current?.open();
    },
  }));

  const _renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <ActionButtonBottom
          actions={[
            {
              label: "Xác nhận",
              variant: "success",
              onPress: handleSubmit(
                (value) => {
                  onSuccess?.(value, index);
                  bottomSheetRef.current?.close();
                },
                (errors) => {
                  // Validation errors sẽ được hiển thị tự động qua error prop trong Input
                  console.log("Validation errors:", errors);
                },
              ),
            },
          ]}
        />
      </BottomSheetFooter>
    ),
    [index, onSuccess, handleSubmit],
  );

  return (
    <AppSheet
      ref={bottomSheetRef}
      snapPoints={["80%"]}
      header={{ title: "Thông tin người ở cùng", height: 60 }}
      renderFooter={_renderFooter}
    >
      <AppSheetScrollView contentContainerStyle={sheetStyles.body}>
        <View>
          <Controller
            control={control}
            name="name"
            rules={{
              required: "Vui lòng nhập họ và tên người ở cùng",
              validate: (value) => {
                if (!value || value.trim() === "") {
                  return "Vui lòng nhập họ và tên người ở cùng";
                }
                return true;
              },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                inputComponent={BottomSheetTextInput}
                label="Họ tên"
                value={value}
                onChangeText={onChange}
                placeholder="Nhập họ và tên"
                icon="person-outline"
                required
                error={error?.message}
              />
            )}
          />
        </View>

        <View>
          <Controller
            control={control}
            name="phoneNumber"
            rules={{
              required: "Vui lòng nhập số điện thoại",
              validate: (value) => {
                if (!value || value.trim() === "") {
                  return "Vui lòng nhập số điện thoại";
                }
                if (value.length < 10) {
                  return "Số điện thoại phải có ít nhất 10 số";
                }
                return true;
              },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                inputComponent={BottomSheetTextInput}
                label="Số điện thoại"
                value={value}
                type="number"
                maxLength={10}
                keyboardType="phone-pad"
                onChangeText={onChange}
                placeholder="Nhập số điện thoại"
                icon="call-outline"
                required
                error={error?.message}
              />
            )}
          />
        </View>

        <View>
          <Controller
            control={control}
            name="idCardNumber"
            render={({ field: { onChange, value } }) => (
              <Input
                inputComponent={BottomSheetTextInput}
                label="CCCD/CMND"
                value={value}
                maxLength={12}
                keyboardType="numeric"
                onChangeText={onChange}
                placeholder="Nhập CCCD/CMND nếu có"
                icon="card-outline"
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="permanentAddress"
          render={({ field: { onChange, value } }) => (
            <Input
              inputComponent={BottomSheetTextInput}
              type="area"
              label="Địa chỉ thường trú"
              value={value}
              onChangeText={onChange}
              placeholder="Nhập địa chỉ thường trú"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          )}
        />

        <NoticeBanner
          tone="success"
          icon="bulb-outline"
          title="Gợi ý nhập thông tin"
          message="Họ tên và số điện thoại là bắt buộc. Các thông tin khác có thể bỏ qua."
        />
      </AppSheetScrollView>
    </AppSheet>
  );
});

CompanionClientComponent.displayName = "CompanionClientComponent";

const sheetStyles = StyleSheet.create({
  body: {
    padding: uiSpace.screen,
    paddingBottom: SHEET_FOOTER_CLEARANCE,
    gap: uiSpace.gap,
  },
});

export default CompanionClientComponent;
