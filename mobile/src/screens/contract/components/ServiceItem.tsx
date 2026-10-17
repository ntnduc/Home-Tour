import Chip from '@/components/Chip';
import IconButton from '@/components/IconButton';
import Input from '@/components/Input';
import StatusBadge from '@/components/StatusBadge';
import { tokens, uiColors, uiRadius, uiType } from '@/theme';
import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from '@/constant/service.constant';
import { ContractServiceCreateRequest } from '@/types/contract-service';
import { formatCurrency } from '@/utils/appUtil';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDebounce } from 'use-debounce';

interface ServiceItemProps {
  service: ContractServiceCreateRequest;
  index: number;
  onEdit: () => void;
  onDelete: (fieldId: string, valueObj: any) => void;
  onChange: (service: ContractServiceCreateRequest) => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  index,
  onEdit,
  onChange,
  onDelete,
}) => {
  const _onChangeHelperValue = useDebounce((text: string) => {
    onChange({ ...service, helperValue: Number(text) });
  }, 1000);

  const method = SERVICE_CALCULATE_METHOD_WITH_INFO[service.calculationMethod];

  return (
    <View style={styles.tile}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={uiType.bodyStrong} numberOfLines={1}>
            {service?.name}
          </Text>
          <Text style={styles.price}>
            {formatCurrency(service?.price?.toString() ?? '0')}đ/{method.unit}
          </Text>
        </View>
        <IconButton
          icon="create-outline"
          size="sm"
          onPress={onEdit}
          accessibilityLabel={`Sửa dịch vụ ${service?.name ?? ''}`}
        />
        <IconButton
          icon="trash-outline"
          tone="error"
          size="sm"
          onPress={() => onDelete(service.fieldId ?? '', service)}
          accessibilityLabel={`Xoá dịch vụ ${service?.name ?? ''}`}
        />
      </View>

      <View style={styles.metaRow}>
        <Chip icon={method.icon} label={method.label} variant="outline" />
        <StatusBadge
          size="sm"
          tone={service.isEnabled ? 'success' : 'neutral'}
          label={service.isEnabled ? 'Đã chọn trong hợp đồng' : 'Không sử dụng'}
        />
      </View>

      {service.isEnabled &&
        service.calculationMethod === ServiceCalculateMethod.PER_UNIT_SIMPLE && (
          <Input
            required
            type="number"
            defaultValue={service.helperValue?.toString()}
            label={`Chỉ số hiện tại (${service.name?.toLocaleLowerCase()?.trim()})`}
            onChangeText={(text) => _onChangeHelperValue[0](text)}
          />
        )}
      {service.isEnabled &&
        service.calculationMethod === ServiceCalculateMethod.FIXED_PER_NUMBER && (
          <Input
            required
            type="number"
            defaultValue={service.helperValue?.toString()}
            onChangeText={(text) => _onChangeHelperValue[0](text)}
            label="Số lượng sử dụng"
          />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    gap: 10,
    padding: 12,
    borderRadius: uiRadius.tile,
    backgroundColor: uiColors.canvas,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  price: {
    ...uiType.bodyStrong,
    color: tokens.colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
});

export default ServiceItem;
