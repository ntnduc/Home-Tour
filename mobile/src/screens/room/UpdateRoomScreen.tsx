import { getRoom, updateRoom } from '@/api/room/room.api';
import ActionButtonBottom from '@/components/ActionButtonBottom';
import Card from '@/components/Card';
import Chip from '@/components/Chip';
import { ComboBox } from '@/components/ComboBox';
import InputBase from '@/components/Input';
import Loading from '@/components/Loading';
import FormScreen from '@/components/FormScreen';
import FormSection from '@/components/FormSection';
import IconSquircle from '@/components/IconSquircle';
import Status from '@/components/Status';
import { Switch } from '@/components/Switch';
import CommonUpload from '@/components/Uploadfile';
import { FileCategory } from '@/components/Uploadfile/fileEnum';
import { ROOM_STATUS_OPTIONS } from '@/constant/room.constant';
import { tokens, uiSpace, uiType } from '@/theme';
import {
  RoomDetailResponse,
  RoomStatus,
  RoomUpdateRequest,
} from '@/types/room';
import { formatCurrency } from '@/utils/appUtil';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  UpdateRoom: { roomId: string };
  RoomList: undefined;
};

type UpdateRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: { params: { roomId: any } };
};

const UpdateRoomScreen = ({ navigation, route }: UpdateRoomScreenProps) => {
  const { roomId } = route.params;
  const [uploadProgress, setUploadProgress] = useState(false);
  const {
    handleSubmit,
    formState: { isLoading, defaultValues, errors: erroForms, isSubmitting },
    control,
    setValue,
  } = useForm<RoomDetailResponse>({
    defaultValues: async () => {
      try {
        const data = await getRoom(roomId);
        if (!data.data) return {} as any;
        return data.data;
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: error.response.data?.message
            ? error.response.data?.message
            : 'Không tìm thấy dữ liệu',
        });
        navigation.goBack();
      }
    },
  });

  const handleSave = async (data: RoomUpdateRequest) => {
    try {
      updateRoom(data)
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: 'Cập nhật đã thành công',
          });
          navigation.goBack();
        })
        .catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Thất bại',
            text2: 'Vui lòng thử lại sau!',
          });
        });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Thất bại',
        text2: 'Vui lòng thử lại sau!',
      });
    }
  };


  const handleError = () => {
    Toast.show({
      type: 'error',
      text1: 'Lỗi',
      text2: 'Hãy nhập đầy đủ thông tin lại thông tin!',
    });
  };

  if (isLoading || !defaultValues) {
    return <Loading />;
  }

  const footer = (
    <ActionButtonBottom
      actions={[
        {
          label: 'Lưu thay đổi',
          onPress: handleSubmit(handleSave, handleError),
          variant: 'primary',
          isLoading: isLoading || isSubmitting || uploadProgress,
          icon: 'checkmark-circle',
        },
        {
          label: 'Xoá phòng',
          onPress: handleSubmit(handleSave, handleError),
          variant: 'danger',
          isLoading: isLoading || isSubmitting || uploadProgress,
          icon: 'trash-outline',
          hidden: () => defaultValues?.status === RoomStatus.OCCUPIED,
        },
      ]}
    />
  );

  return (
    <FormScreen footer={footer}>
        {/* Summary: name · rent · status */}
        <Card style={styles.summary}>
          <IconSquircle icon="bed" />
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle} numberOfLines={1}>
              {defaultValues?.name}
            </Text>
            <Text style={styles.summaryPrice}>
              {defaultValues?.rentAmount?.toLocaleString()}đ/tháng
            </Text>
          </View>
          <Status value={defaultValues?.status} options={ROOM_STATUS_OPTIONS} />
        </Card>

        <FormSection title="Thông tin cơ bản" icon="information-circle-outline">
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Vui lòng nhập tên gợi nhớ' }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                placeholder="Nhập tên gợi nhớ"
                value={value}
                required
                onChangeText={onChange}
                icon="home"
                label="Tên gợi nhớ"
                error={erroForms.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="propertyName"
            render={({ field: { onChange, value } }) => (
              <InputBase
                readOnly
                disabled
                value={value}
                showClear={false}
                onChangeText={onChange}
                icon="business"
                label="Toà nhà"
              />
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <ComboBox
                options={
                  value !== RoomStatus.OCCUPIED
                    ? ROOM_STATUS_OPTIONS.filter(
                        (option) => option.value !== RoomStatus.OCCUPIED,
                      )
                    : ROOM_STATUS_OPTIONS
                }
                valueKey={'value'}
                value={value}
                onChange={(option) => {
                  onChange(option.value);
                }}
                disabled={value === RoomStatus.OCCUPIED}
                label="Trạng thái"
                icon="checkmark-circle"
                placeholder="Chọn trạng thái"
                error={erroForms.status?.message}
                isSearch={false}
              />
            )}
          />
          <View style={styles.fieldRow}>
            <View style={styles.fieldCol}>
              <Controller
                control={control}
                name="floor"
                render={({ field: { onChange, value } }) => (
                  <InputBase
                    placeholder="Tầng"
                    type="number"
                    value={value}
                    onChangeText={onChange}
                    icon="layers"
                    label="Tầng"
                  />
                )}
              />
            </View>
            <View style={styles.fieldCol}>
              <Controller
                control={control}
                name="maxOccupancy"
                render={({ field: { onChange, value } }) => (
                  <InputBase
                    type="number"
                    placeholder="Số người"
                    value={value?.toString()}
                    keyboardType="numeric"
                    onChangeText={onChange}
                    icon="people"
                    label="Số người tối đa"
                    error={erroForms.maxOccupancy?.message}
                  />
                )}
              />
            </View>
          </View>
          <Controller
            control={control}
            name="area"
            render={({ field: { onChange, value } }) => (
              <InputBase
                type="number"
                placeholder="Diện tích (m²)"
                value={value?.toString()}
                onChangeText={onChange}
                icon="resize"
                label="Diện tích"
                error={erroForms.area?.message}
              />
            )}
          />
        </FormSection>

        <FormSection title="Giá & thanh toán" icon="cash-outline">
          <Controller
            control={control}
            name="rentAmount"
            rules={{ required: 'VNĐ/tháng' }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                type="number"
                placeholder="VNĐ/tháng"
                value={value ? formatCurrency(value.toString()) : ''}
                keyboardType="numeric"
                required
                onChangeText={onChange}
                icon="cash"
                label="Giá thuê mặc định"
                error={erroForms.rentAmount?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="defaultDepositAmount"
            rules={{ required: 'VNĐ/tháng' }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                type="number"
                placeholder="VNĐ"
                value={value ? formatCurrency(value.toString()) : ''}
                keyboardType="numeric"
                required
                onChangeText={onChange}
                icon="shield-checkmark"
                label="Tiền cọc"
                error={erroForms.defaultDepositAmount?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="isPrepaidRoom"
            render={({ field: { onChange, value } }) => (
              <Switch
                label="Thanh toán tiền phòng trước"
                alignLabel="horizontal"
                value={value as boolean}
                onValueChange={onChange}
              />
            )}
          />
        </FormSection>

        <FormSection title="Ghi chú" icon="document-text-outline">
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <InputBase
                type="area"
                placeholder="Điều khoản bổ sung"
                value={value ? formatCurrency(value.toString()) : ''}
                onChangeText={onChange}
                error={erroForms.description?.message}
              />
            )}
          />
        </FormSection>

        <Controller
          control={control}
          name="imageCollectionId"
          render={({ field: { value } }) => (
            <CommonUpload
              label="Ảnh thực tế"
              typeFile="image"
              typeAction="update"
              variant="multiple"
              value={value}
              postData={{
                category: FileCategory.ROOM,
                relatedEntityId: defaultValues?.id,
                propertyId: defaultValues?.propertyId,
                collectionId: value,
                isPublic: true,
              }}
              onChange={(files, status) => {
                setUploadProgress(status !== 'success');
              }}
            />
          )}
        />

        <FormSection
          title="Dịch vụ mặc định"
          icon="flash-outline"
          caption="Bạn có thể thêm hoặc chỉnh sửa dịch vụ khi tạo hợp đồng"
        >
          {defaultValues?.contractServices?.length ? (
            <View style={styles.chipWrap}>
              {defaultValues.contractServices.map((service, index) => (
                <Chip key={index} label={service?.name ?? ''} icon="flash-outline" />
              ))}
            </View>
          ) : (
            <Text style={uiType.caption}>
              Chưa có dịch vụ mặc định — hãy thêm trong phần cập nhật tòa nhà.
            </Text>
          )}
        </FormSection>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    ...uiType.section,
    lineHeight: 24,
  },
  summaryPrice: {
    ...uiType.bodyStrong,
    color: tokens.colors.primary,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: uiSpace.gap,
  },
  fieldCol: {
    flex: 1,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export default UpdateRoomScreen;
