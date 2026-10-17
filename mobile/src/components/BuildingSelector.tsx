import { ComboOptionWithExtra } from "@/types/comboOption";
import { PropertyDetail } from "@/types/property";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fieldColors, fieldStyles } from "./FormField";
import IconSquircle from "./IconSquircle";
import PressableScale from "./PressableScale";
import { uiType } from "@/theme";

export interface BuildingSelectorProps {
  buildings: ComboOptionWithExtra<string, string, PropertyDetail>[];
  selectedBuilding: string | null;
  onOpen?: () => void;
}

/**
 * Property filter trigger (opens a picker sheet).
 *
 * ```
 * ╭───────────────────────────────────────╮ field box (48)
 * │ ▣  TÒA NHÀ                        ⌄  │ eyebrow + selected name
 * │    Tất cả tòa nhà                     │
 * ╰───────────────────────────────────────╯
 * ```
 */
const BuildingSelector = ({ buildings, selectedBuilding, onOpen }: BuildingSelectorProps) => {
  const selected = selectedBuilding
    ? buildings.find((b) => b.value && b.extra && b.value === selectedBuilding)
    : undefined;

  return (
    <PressableScale
      onPress={() => onOpen?.()}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel="Chọn tòa nhà"
      style={[fieldStyles.box, styles.box]}
    >
      <IconSquircle icon="business-outline" size="sm" />
      <View style={styles.text}>
        <Text style={uiType.eyebrow}>Tòa nhà</Text>
        <Text style={fieldStyles.text} numberOfLines={1}>
          {selected?.extra?.name ?? "Tất cả tòa nhà"}
        </Text>
      </View>
      <Ionicons name="chevron-down" size={18} color={fieldColors.icon} />
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  box: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});

export default BuildingSelector;
