import ActionButtonBottom from '@/components/ActionButtonBottom';
import { stylesHeader } from '@/components/AppSheet/AppSheet';
import AppSheetBackdropComponent from '@/components/AppSheet/AppSheetBackdropComponent';
import AppSheetHandleComponent from '@/components/AppSheet/AppSheetHandleComponent';
import AppSheetHeader from '@/components/AppSheet/AppSheetHeader';
import Input from '@/components/Input';
import NoticeBanner from '@/components/NoticeBanner';
import { uiSpace } from '@/theme';
import { ClientCreateRequest } from '@/types/client';
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const styleHeader = stylesHeader;
  const [index, setIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClientCreateRequest>({
    defaultValues: {
      name: '',
      phoneNumber: '',
      isLandlordClient: false,
      isActive: true,
    },
  });

  useImperativeHandle(ref, () => ({
    close: () => {
      bottomSheetRef.current?.close();
      setIsOpen(false);
    },
    expand: (client: ClientCreateRequest, idx: number) => {
      setIndex(idx);
      setIsOpen(true);
      reset({
        name: client?.name || '',
        phoneNumber: client?.phoneNumber || '',
        idCardNumber: client?.idCardNumber,
        permanentAddress: client?.permanentAddress,
        isLandlordClient: false,
        isActive: true,
      });

      setTimeout(() => {
        bottomSheetRef.current?.expand();
      }, 100);
    },
  }));

  const _renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <ActionButtonBottom
          actions={[
            {
              label: 'Xác nhận',
              variant: 'success',
              onPress: handleSubmit(
                (value) => {
                  onSuccess?.(value, index);
                  bottomSheetRef.current?.close();
                },
                (errors) => {
                  // Validation errors sẽ được hiển thị tự động qua error prop trong Input
                  console.log('Validation errors:', errors);
                },
              ),
            },
          ]}
        />
      </BottomSheetFooter>
    ),
    [index, onSuccess, handleSubmit],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <AppSheetBackdropComponent
        {...props}
        onBackdropPress={() => {
          bottomSheetRef.current?.close();
        }}
      />
    ),
    [],
  );

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['90%']}
        onClose={() => {
          setIsOpen(false);
        }}
        index={-1}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableOverDrag={false}
        handleComponent={AppSheetHandleComponent}
        enableHandlePanningGesture={true}
        detached={true}
        footerComponent={_renderFooter}
      >
        <View style={[styleHeader.fixedHeaderContainer, { height: 60 }]}>
          <AppSheetHeader
            title="Thông tin người ở cùng"
            onClose={() => {
              bottomSheetRef.current?.close();
            }}
          />
        </View>
        <BottomSheetScrollView
          style={sheetStyles.scroll}
          contentContainerStyle={sheetStyles.body}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          <View>
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Vui lòng nhập họ và tên người ở cùng',
                validate: (value) => {
                  if (!value || value.trim() === '') {
                    return 'Vui lòng nhập họ và tên người ở cùng';
                  }
                  return true;
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Input
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
                required: 'Vui lòng nhập số điện thoại',
                validate: (value) => {
                  if (!value || value.trim() === '') {
                    return 'Vui lòng nhập số điện thoại';
                  }
                  if (value.length < 10) {
                    return 'Số điện thoại phải có ít nhất 10 số';
                  }
                  return true;
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Input
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
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
});

CompanionClientComponent.displayName = 'CompanionClientComponent';

const sheetStyles = StyleSheet.create({
  scroll: {
    marginTop: 60,
    marginBottom: 90,
  },
  body: {
    padding: uiSpace.screen,
    gap: uiSpace.gap,
  },
});

export default CompanionClientComponent;
