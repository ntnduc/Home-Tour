import Card from "@/components/Card";
import Input from "@/components/Input";
import PressableScale from "@/components/PressableScale";
import { tokens, uiColors, uiRadius, uiSpace, uiType, uiWeight } from "@/theme";
import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from "@/constant/service.constant";
import { InvoiceCreateRequest } from "@/types/invoice";
import {
  InvoiceItemCreateRequest,
  InvoiceItemType,
} from "@/types/invoice.item";
import { formatCurrency } from "@/utils/appUtil";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useCallback } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";

/** Card shell of one service line: title/description on the left, edit chip on the right. */
const ServiceItemCard = ({
  title,
  description,
  action,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <Card style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardTitle}>
        <Text style={uiType.section} numberOfLines={1}>
          {title}
        </Text>
        {description ? <Text style={uiType.caption}>{description}</Text> : null}
      </View>
      {action}
    </View>
    {children}
  </Card>
);

/** Pill that toggles editing of the old reading / count (warning tone once editing). */
const EditChip = ({
  isUpdated,
  idleLabel,
  onPress,
}: {
  isUpdated: boolean;
  idleLabel: string;
  onPress: () => void;
}) => (
  <PressableScale
    onPress={onPress}
    scaleTo={0.94}
    hitSlop={8}
    style={[styles.chip, isUpdated ? styles.chipUpdated : styles.chipIdle]}
  >
    <Ionicons
      name={isUpdated ? "refresh-outline" : "create-outline"}
      size={16}
      color={isUpdated ? tokens.palette.amber[600] : tokens.colors.info}
    />
    <Text
      style={[
        styles.chipLabel,
        { color: isUpdated ? tokens.palette.amber[600] : tokens.colors.info },
      ]}
    >
      {isUpdated ? "Hủy và đặt lại" : idleLabel}
    </Text>
  </PressableScale>
);

/** "Tạm tính" row: label left, highlighted amount right. */
const EstimateRow = ({ children }: { children: ReactNode }) => (
  <View style={styles.estimateRow}>
    <Text style={uiType.bodyStrong}>Tạm tính</Text>
    {children}
  </View>
);

/**
 * Editable service lines of a draft invoice (one card per service).
 *
 * ```
 * ┌ Card soft ───────────────────────────────────┐
 * │ Điện                          [✎ Sửa số cũ]  │ title · edit chip
 * │ 3.500 đ/ kWh                                 │ caption
 * │ [ Số cũ ]  [ Số mới ]                        │ Inputs
 * │ Sản lượng                          120 kWh   │
 * │ Tạm tính                      420.000 đ      │ info, bold
 * └──────────────────────────────────────────────┘
 * ```
 */
const ServiceInvoiceItem = () => {
  const { control, getValues, setValue } =
    useFormContext<InvoiceCreateRequest>();

  const invoiceItems = useWatch({
    control,
    name: "invoiceItems",
    defaultValue: [],
  });

  const handleConfirmEditNew = useCallback(
    (index: number, callback?: () => void) => {
      const isUpdate = getValues(`invoiceItems.${index}.isUpdated`);
      if (!isUpdate) {
        Alert.alert(
          "Chỉnh sửa chỉ số cũ",
          "Bạn chắc chắn muốn sửa chỉ số cũ? Hãy đảm bảo ghi nhận đúng số trước đó.",
          [
            { text: "Huỷ", style: "cancel" },
            {
              text: "Đồng ý",
              style: "destructive",
              onPress: () => {
                setValue(`invoiceItems.${index}.isUpdated`, true);
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "Hủy và đặt lại",
          "Bạn chắc chắn muốn hủy và đặt lại chỉ số cũ?",
          [
            { text: "Huỷ", style: "cancel" },
            {
              text: "Đồng ý",
              style: "destructive",
              onPress: () => {
                setValue(`invoiceItems.${index}.isUpdated`, false);
                callback?.();
              },
            },
          ],
        );
      }
    },
    [],
  );

  const calPrice = useCallback(
    (serviceItem: InvoiceItemCreateRequest, index: number) => {
      const calculatedHelperValueNumber = calculatedHelperValue(
        serviceItem,
        index,
      );
      const amount = getValues(`invoiceItems.${index}.amount`);
      return Number(amount) * calculatedHelperValueNumber;
    },
    [],
  );

  const calculatedHelperValue = useCallback(
    (serviceItem: InvoiceItemCreateRequest, index: number) => {
      const newHelperValue = getValues(`invoiceItems.${index}.newHelperValue`);
      const oldHelperValue = getValues(`invoiceItems.${index}.oldHelperValue`);
      const checkHelperValue = newHelperValue
        ? newHelperValue
        : (oldHelperValue ?? 0);

      if (Number(serviceItem.helperValue) <= Number(checkHelperValue)) {
        return 0;
      }
      return (serviceItem.helperValue ?? 0) - checkHelperValue;
    },
    [],
  );

  const _serviceCalculatorSimple = (
    serviceItem: InvoiceItemCreateRequest,
    index: number,
  ) => {
    const unit =
      SERVICE_CALCULATE_METHOD_WITH_INFO[
        serviceItem.calculationMethod ?? ServiceCalculateMethod.PER_UNIT_SIMPLE
      ].unit;
    return (
      <ServiceItemCard
        key={serviceItem.contractServiceId}
        title={serviceItem.name}
        description={`${formatCurrency(serviceItem.amount)} đ/ ${unit}`}
        action={
          <EditChip
            isUpdated={!!getValues(`invoiceItems.${index}.isUpdated`)}
            idleLabel="Sửa số người"
            onPress={() =>
              handleConfirmEditNew(index, () => {
                setValue(
                  `invoiceItems.${index}.newHelperValue`,
                  getValues(`invoiceItems.${index}.oldHelperValue`),
                );
              })
            }
          />
        }
      >
        <View style={styles.fieldRow}>
          <View style={styles.field}>
            <Controller
              control={control}
              rules={{ required: "Vui lòng nhập số cũ" }}
              name={`invoiceItems.${index}.newHelperValue`}
              render={({ field: { onChange, value } }) => {
                return (
                  <Input
                    label="Số cũ"
                    value={value?.toString()}
                    type="number"
                    keyboardType="numeric"
                    min={0}
                    disabled={!getValues(`invoiceItems.${index}.isUpdated`)}
                    onChangeText={onChange}
                    showClear={false}
                  />
                );
              }}
            />
          </View>

          <View style={styles.field}>
            <Controller
              control={control}
              name={`invoiceItems.${index}.helperValue`}
              rules={{ required: "Vui lòng nhập số mới" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                return (
                  <Input
                    label="Số mới"
                    value={value?.toString()}
                    type="number"
                    keyboardType="numeric"
                    required
                    error={error?.message}
                    onChangeText={onChange}
                    showClear={false}
                  />
                );
              }}
            />
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={uiType.body}>Sản lượng</Text>
            <Text style={uiType.bodyStrong}>
              {formatCurrency(calculatedHelperValue(serviceItem, index)) || "0"}{" "}
              {unit}
            </Text>
          </View>
          <EstimateRow>
            <Text style={styles.estimate}>
              {formatCurrency(calPrice(serviceItem, index))} đ
            </Text>
          </EstimateRow>
        </View>
      </ServiceItemCard>
    );
  };

  const _serviceCalculatorFixedPerRoom = (
    serviceItem: InvoiceItemCreateRequest,
    index: number,
  ) => {
    return (
      <ServiceItemCard
        key={serviceItem.contractServiceId}
        title={serviceItem.name}
      >
        <EstimateRow>
          <Text style={styles.estimate}>
            {formatCurrency(serviceItem.amount)} đ
          </Text>
        </EstimateRow>
      </ServiceItemCard>
    );
  };

  const _serviceCalculatorFixedPerPerson = (
    serviceItem: InvoiceItemCreateRequest,
    index: number,
  ) => {
    return (
      <ServiceItemCard
        key={serviceItem.contractServiceId}
        title={serviceItem.name}
        description={`${formatCurrency(serviceItem.amount)} đ/ ${SERVICE_CALCULATE_METHOD_WITH_INFO[serviceItem.calculationMethod ?? ServiceCalculateMethod.FIXED_PER_PERSON].unit}`}
        action={
          <EditChip
            isUpdated={!!getValues(`invoiceItems.${index}.isUpdated`)}
            idleLabel="Sửa số người"
            onPress={() =>
              handleConfirmEditNew(index, () => {
                setValue(
                  `invoiceItems.${index}.helperValue`,
                  getValues(`invoiceItems.${index}.oldHelperValue`),
                );
              })
            }
          />
        }
      >
        <Controller
          control={control}
          name={`invoiceItems.${index}.helperValue`}
          render={({ field: { onChange, value } }) => {
            return (
              <Input
                label="Số người"
                disabled={!getValues(`invoiceItems.${index}.isUpdated`)}
                value={value?.toString()}
                type="number"
                keyboardType="numeric"
                onChangeText={onChange}
                showClear={false}
              />
            );
          }}
        />

        <EstimateRow>
          <Controller
            control={control}
            name={`invoiceItems.${index}.helperValue`}
            render={({ field: { onChange, value } }) => {
              const calPrice = Number(serviceItem.amount) * (value ?? 0);
              return (
                <Text style={styles.estimate}>
                  {formatCurrency(calPrice)} đ
                </Text>
              );
            }}
          />
        </EstimateRow>
      </ServiceItemCard>
    );
  };

  const _serviceCalculatorFixedPerNumber = (
    serviceItem: InvoiceItemCreateRequest,
    index: number,
  ) => {
    return (
      <ServiceItemCard
        key={serviceItem.contractServiceId}
        title={serviceItem.name}
        description={`${formatCurrency(serviceItem.amount)} đ/ ${SERVICE_CALCULATE_METHOD_WITH_INFO[serviceItem.calculationMethod ?? ServiceCalculateMethod.FIXED_PER_NUMBER].unit}`}
        action={
          <EditChip
            isUpdated={!!getValues(`invoiceItems.${index}.isUpdated`)}
            idleLabel="Sửa số lượng"
            onPress={() =>
              handleConfirmEditNew(index, () => {
                setValue(
                  `invoiceItems.${index}.helperValue`,
                  getValues(`invoiceItems.${index}.oldHelperValue`),
                );
              })
            }
          />
        }
      >
        <Controller
          control={control}
          name={`invoiceItems.${index}.helperValue`}
          render={({ field: { onChange, value } }) => {
            return (
              <Input
                label="Số lượng"
                value={value?.toString()}
                type="number"
                keyboardType="numeric"
                disabled={!getValues(`invoiceItems.${index}.isUpdated`)}
                onChangeText={onChange}
                showClear={false}
              />
            );
          }}
        />
        <EstimateRow>
          <Controller
            control={control}
            name={`invoiceItems.${index}.helperValue`}
            render={({ field: { onChange, value } }) => {
              const calPrice = Number(serviceItem.amount) * (value ?? 0);
              return (
                <Text style={styles.estimate}>
                  {formatCurrency(calPrice)} đ
                </Text>
              );
            }}
          />
        </EstimateRow>
      </ServiceItemCard>
    );
  };

  const _renderServiceItem = (
    serviceItem: InvoiceItemCreateRequest,
    index: number,
  ) => {
    switch (serviceItem.calculationMethod) {
      case ServiceCalculateMethod.PER_UNIT_SIMPLE:
        return _serviceCalculatorSimple(serviceItem, index);
      case ServiceCalculateMethod.FIXED_PER_ROOM:
        return _serviceCalculatorFixedPerRoom(serviceItem, index);
      case ServiceCalculateMethod.FIXED_PER_PERSON:
        return _serviceCalculatorFixedPerPerson(serviceItem, index);
      case ServiceCalculateMethod.FIXED_PER_NUMBER:
        return _serviceCalculatorFixedPerNumber(serviceItem, index);
      default:
        return <View />;
    }
  };

  return (
    <View style={styles.list}>
      {invoiceItems
        ?.filter((item) => item.type === InvoiceItemType.SERVICE_FEE)
        ?.map((serviceItem, index) => {
          return (
            <View key={serviceItem.contractServiceId}>
              {
                // +1 vì item đầu tiên là tiền phòng
                _renderServiceItem(serviceItem, index + 1)
              }
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: uiSpace.gap,
  },
  card: {
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: uiSpace.gap,
  },
  cardTitle: {
    flex: 1,
    gap: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: uiRadius.pill,
  },
  chipIdle: {
    backgroundColor: tokens.colors.infoSurface,
  },
  chipUpdated: {
    backgroundColor: tokens.colors.warningSurface,
  },
  chipLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: uiWeight.semibold,
  },
  fieldRow: {
    flexDirection: "row",
    gap: uiSpace.gap,
  },
  field: {
    flex: 1,
  },
  summary: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: uiColors.hairline,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  estimate: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: uiWeight.bold,
    color: tokens.colors.info,
  },
});

export default ServiceInvoiceItem;
