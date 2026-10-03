import CardContent from '@/components/CardContent';
import InputBase from '@/components/Input';
import { ServiceCalculateMethod } from '@/constant/service.constant';
import { createStyles } from '@/styles/StyleCreateTenantScreen';
import { useTheme } from '@/theme/ThemeProvider';
import { PropertyUpdateRequest } from '@/types/property';
import { ServiceCreateOrUpdateRequest } from '@/types/service';
import { formatCurrency } from '@/utils/appUtil';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import CalculatorMethodComponent from '../../tenant/components/CalculatorMethodComponent';
import ServiceSelectedSearchComponent from '../../tenant/components/ServiceSelectedSearchComponent';

type ServiceField = ServiceCreateOrUpdateRequest & { fieldId?: string };

type Props = {
  control: Control<PropertyUpdateRequest>;
  errors: FieldErrors<PropertyUpdateRequest>;
  services: ServiceField[];
  setValue: UseFormSetValue<PropertyUpdateRequest>;
  watch: UseFormWatch<PropertyUpdateRequest>;
  onAdd: () => void;
  onRemove: (index: number, service: ServiceField) => void;
};

const PropertyServiceSection = ({
  control,
  errors,
  services,
  setValue,
  watch,
  onAdd,
  onRemove,
}: Props) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <CardContent
      title={
        <View className="flex-row items-center justify-between mb-4">
          <Text style={styles.label}>Dịch vụ thu phí</Text>
          <TouchableOpacity style={styles.addServiceButton} onPress={onAdd}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addServiceButtonText}>Thêm dịch vụ</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View className="gap-3 rounded-lg">
        {services &&
          services.map((service, index) => (
            <View
              key={service.fieldId || String(index)}
              className="gap-2 bg-white p-3 rounded-lg border border-[#e9ecef] mb-2"
              style={{ position: 'relative' }}
            >
              <TouchableOpacity
                style={styles.removeServiceItemButton}
                onPress={() => onRemove(index, service)}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
              <View className="flex-row gap-2 items-center">
                <View className="gap-2 flex-1">
                  <Controller
                    control={control}
                    name={`services.${index}.name`}
                    render={({ field: { value } }) => (
                      <ServiceSelectedSearchComponent
                        value={value}
                        service={service}
                        onChange={(newService) => {
                          setValue(
                            `services.${index}`,
                            newService as any,
                          );
                        }}
                        error={errors.services?.[index]?.name?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`services.${index}.price`}
                    rules={{ required: 'Vui lòng nhập giá dịch vụ' }}
                    render={({ field: { value } }) => {
                      const currentService = watch(`services.${index}`);
                      const currentMethod = currentService?.calculationMethod;
                      return (
                        <InputBase
                          placeholder="Giá"
                          disabled={
                            currentMethod === ServiceCalculateMethod.FREE
                          }
                          icon="cash-outline"
                          iconProps={{
                            color: '#007AFF',
                          }}
                          value={
                            currentMethod === ServiceCalculateMethod.FREE
                              ? '0'
                              : value
                                ? formatCurrency(value.toString())
                                : ''
                          }
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9]/g, '');
                            setValue(
                              `services.${index}.price`,
                              Number(numericValue),
                            );
                          }}
                          keyboardType="numeric"
                          error={errors.services?.[index]?.price?.message}
                        />
                      );
                    }}
                  />
                  <Controller
                    control={control}
                    name={`services.${index}.calculationMethod`}
                    render={({ field: { onChange, value } }) => (
                      <CalculatorMethodComponent
                        value={value}
                        onChange={(newMethod) => {
                          onChange(newMethod);
                          if (newMethod === ServiceCalculateMethod.FREE) {
                            setValue(`services.${index}.price`, 0);
                          }
                        }}
                      />
                    )}
                  />
                </View>
              </View>
            </View>
          ))}
      </View>
    </CardContent>
  );
};

export default PropertyServiceSection;
