import AddButton from "@/components/AddButton";
import { FieldError } from "@/components/FormField";
import FormSection from "@/components/FormSection";
import IconButton from "@/components/IconButton";
import IconSquircle from "@/components/IconSquircle";
import { tokens, uiColors, uiRadius, uiType } from "@/theme";
import { ClientCreateRequest } from "@/types/client";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type PartnerClientsSectionProps = {
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  data?: ClientCreateRequest[];
  error?: string;
};

/**
 * "Người ở cùng" section of the create-contract form.
 *
 * ```
 * ▣ Người ở cùng                    [+ Thêm]
 * ───────────────────────────────────────────
 * ╭ ▣ Nguyễn B · SĐT · CCCD        (✎)(🗑) ╮  tile per companion
 * ```
 */
const PartnerClientsSection: React.FC<PartnerClientsSectionProps> = ({
  onAdd,
  onEdit,
  onDelete,
  error,
  data,
}) => {
  const hasCompanion = !!data && data.length > 0;

  return (
    <FormSection
      title="Người ở cùng"
      icon="people-outline"
      caption={hasCompanion ? `${data.length} người` : "Có thể bỏ qua nếu không có người ở cùng"}
      style={error ? styles.cardError : undefined}
      action={
        <AddButton
          label="Thêm"
          icon="person-add-outline"
          variant="soft"
          onPress={onAdd}
          accessibilityLabel="Thêm người ở cùng"
        />
      }
    >
      {!hasCompanion ? (
        <Text style={uiType.caption}>Chưa thêm người ở cùng nào.</Text>
      ) : (
        data.map((client, idx) => (
          <View key={`companion-${idx}`} style={styles.tile}>
            <IconSquircle icon="person-outline" tone="neutral" size="sm" />
            <View style={styles.flex}>
              <Text style={uiType.bodyStrong} numberOfLines={1}>
                {client.name}
              </Text>
              {client.phoneNumber ? (
                <Text style={uiType.caption}>SĐT: {client.phoneNumber}</Text>
              ) : null}
              {client.idCardNumber ? (
                <Text style={uiType.caption}>CCCD/CMND: {client.idCardNumber}</Text>
              ) : null}
            </View>
            <IconButton
              icon="create-outline"
              size="sm"
              onPress={() => onEdit(idx)}
              accessibilityLabel={`Cập nhật ${client.name}`}
            />
            <IconButton
              icon="trash-outline"
              tone="error"
              size="sm"
              onPress={() => onDelete(idx)}
              accessibilityLabel={`Xoá ${client.name}`}
            />
          </View>
        ))
      )}
      <FieldError message={error} />
    </FormSection>
  );
};

const styles = StyleSheet.create({
  cardError: {
    borderWidth: 1,
    borderColor: tokens.colors.error,
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: uiRadius.tile,
    backgroundColor: uiColors.canvas,
  },
  flex: {
    flex: 1,
  },
});

export default PartnerClientsSection;
