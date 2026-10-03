import {
  getComboDistricts,
  getComboProvinces,
  getComboWards,
} from '@/api/location/location.api';
import { getProperty, updateProperty } from '@/api/property/property.api';
import ActionButtonBottom from '@/components/ActionButtonBottom';
import Loading from '@/components/Loading';
import { ServiceCalculateMethod } from '@/constant/service.constant';
import { createStyles } from '@/styles/StyleCreateTenantScreen';
import { useTheme } from '@/theme/ThemeProvider';
import { ComboOption } from '@/types/comboOption';
import {
  mapPropertyDetailToUpdateRequest,
  PropertyUpdateRequest,
} from '@/types/property';
import { ServiceCreateOrUpdateRequest } from '@/types/service';
import { generateId } from '@/utils/appUtil';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../navigation/types';
import PropertyAddressSection from './components/PropertyAddressSection';
import PropertyBasicInfoSection from './components/PropertyBasicInfoSection';
import PropertyPricingSection from './components/PropertyPricingSection';
import PropertyServiceSection from './components/PropertyServiceSection';

type UpdatePropertyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UpdateProperty'>;
  route: RouteProp<RootStackParamList, 'UpdateProperty'>;
};

const UpdatePropertyScreen = ({
  navigation,
  route,
}: UpdatePropertyScreenProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWard, setIsLoadingWard] = useState(false);
  const [initialData, setInitialData] = useState<PropertyUpdateRequest>();
  const [cities, setCities] = useState<ComboOption<string, string>[]>([]);
  const [districts, setDistricts] = useState<ComboOption<string, string>[]>([]);
  const [wards, setWards] = useState<ComboOption<string, string>[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<
    'provinceCode' | 'districtCode' | 'wardCode' | null
  >(null);

  useEffect(() => {
    const featchData = async () => {
      const responseForm = await getProperty(route.params.propertyId);
      if (!responseForm?.data || !responseForm?.success) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy thông tin!',
        });
        navigation.goBack && navigation.goBack();
        return;
      }
      const formData = mapPropertyDetailToUpdateRequest(responseForm.data);

      setInitialData(formData);

      const fetch = [
        getComboProvinces(),
        getComboDistricts(formData.provinceCode),
        getComboWards(formData.districtCode),
      ];

      axios
        .all(fetch)
        .then(([responseProvince, responseDistricts, responseWards]) => {
          setCities(responseProvince.data || []);
          setDistricts(responseDistricts.data || []);
          setWards(responseWards.data || []);
        })
        .catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Không lấy được vị trí!',
          });
          navigation.goBack && navigation.goBack();
        });
    };
    featchData().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<PropertyUpdateRequest>({
    values: initialData,
  });

  const {
    fields: services,
    prepend,
    remove,
  } = useFieldArray({
    control,
    name: 'services',
    keyName: 'fieldId',
  });

  const getDistricts = async (provinceId: string) => {
    setIsLoadingDistricts(true);
    setIsLoadingWard(true);
    const response = await getComboDistricts(provinceId);
    if (response.success) {
      setDistricts(response.data ?? []);
    } else {
      setDistricts([]);
    }
    setWards([]);
    setIsLoadingDistricts(false);
    setIsLoadingWard(false);
  };

  const getWards = async (districtId: string) => {
    setIsLoadingWard(true);
    const response = await getComboWards(districtId);
    if (response.success) {
      setWards(response.data ?? []);
    }
    setIsLoadingWard(false);
  };

  const handleAddService = () => {
    prepend({
      serviceId: '',
      fieldId: generateId(),
      isNew: true,
      name: '',
      price: 0,
      calculationMethod: ServiceCalculateMethod.FIXED_PER_ROOM,
    });
  };

  const handleRemoveService = (
    index: number,
    service: ServiceCreateOrUpdateRequest,
  ) => {
    const removeServiceIds = getValues('removeServiceIds') || [];
    if (!service.isNew && service.id) {
      setValue('removeServiceIds', [...removeServiceIds, service.id]);
    }
    remove(index);
  };

  const onSubmit = (data: PropertyUpdateRequest) => {
    setIsLoading(true);
    updateProperty(route.params.propertyId, data)
      .then((res) => {
        if (res.success) {
          Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: 'Cập nhật tài sản thành công!',
          });
          navigation.goBack && navigation.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: res.message,
          });
        }
      })
      .catch((err) => {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: err.response.data.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onError = (errors: FieldErrors) => {
    Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
        enableOnAndroid={true}
        extraScrollHeight={30}
        keyboardOpeningTime={0}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PropertyBasicInfoSection control={control} errors={errors} />

        <PropertyAddressSection
          control={control}
          errors={errors}
          cities={cities}
          districts={districts}
          wards={wards}
          isLoadingDistricts={isLoadingDistricts}
          isLoadingWard={isLoadingWard}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          onProvinceChange={getDistricts}
          onDistrictChange={getWards}
        />

        <PropertyPricingSection control={control} errors={errors} />

        <PropertyServiceSection
          control={control}
          errors={errors}
          services={services}
          setValue={setValue}
          watch={watch}
          onAdd={handleAddService}
          onRemove={handleRemoveService}
        />
      </KeyboardAwareScrollView>

      <ActionButtonBottom
        actions={[
          {
            label: 'Cập Nhật',
            onPress: handleSubmit(onSubmit, onError),
            variant: 'primary',
            isLoading: isLoading,
            icon: 'checkmark-circle',
          },
        ]}
      />
    </>
  );
};

export default UpdatePropertyScreen;
