import { ComboOptionWithExtra } from "@/types/comboOption";
import { PropertyDetail } from "@/types/property";
import { Ionicons } from "@expo/vector-icons";
import { tokens, uiColors, uiRadius, uiType, uiWeight } from "@/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fieldColors, fieldStyles } from "./FormField";
import IconSquircle from "./IconSquircle";
import PressableScale from "./PressableScale";

export type BuildingSelectorVariant = "field" | "pill";

export interface BuildingSelectorProps {
  buildings: ComboOptionWithExtra<string, string, PropertyDetail>[];
  selectedBuilding: string | null;
  onOpen?: () => void;
  variant?: BuildingSelectorVariant;
}

/**
 * Property filter trigger (opens a picker sheet).
 *
 * Field variant (default):
 * ```
 * ╭───────────────────────────────────────╮ field box (48)
 * │ ▣  TÒA NHÀ                        ⌄  │ eyebrow + selected name
 * │    Tất cả tòa nhà                     │
 * ╰───────────────────────────────────────╯
 * ```
 *
 * Pill variant (compact header):
 * ```
 * ╭─────────────────────────╮ height 36 · paddingHorizontal 12 · gap 6
 * │ ▣ Tất cả tòa nhà   ⌄   │ radius pill · icon 14 · label 13/18 semibold 1 line maxWidth 140
 * ╰─────────────────────────╯ chevron 14 · PressableScale 0.94 · hitSlop 4 → 44pt target
 * ```
 */
const BuildingSelector = ({
  buildings,
  selectedBuilding,
  onOpen,
  variant = "field",
}: BuildingSelectorProps) => {
  const selected = selectedBuilding
    ? buildings.find((b) => b.value && b.extra && b.value === selectedBuilding)
    : undefined;

  if (variant === "pill") {
    const isSelected = !!selected;
    return (
      <PressableScale
        onPress={() => onOpen?.()}
        scaleTo={0.94}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel="Chọn tòa nhà"
        style={[
          styles.pillButton,
          isSelected && styles.pillButtonSelected,
        ]}
      >
        <Ionicons
          name="business-outline"
          size={14}
          color={isSelected ? tokens.colors.primary : uiColors.textMuted}
        />
        <Text
          style={[
            styles.pillLabel,
            isSelected && styles.pillLabelSelected,
          ]}
          numberOfLines={1}
        >
          {selected?.extra?.name ?? "Tất cả tòa nhà"}
        </Text>
        <Ionicons
          name="chevron-down"
          size={14}
          color={isSelected ? tokens.colors.primary : uiColors.textMuted}
        />
      </PressableScale>
    );
  }

  // Field variant (default)
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
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 12,
    gap: 6,
    borderRadius: uiRadius.pill,
    backgroundColor: uiColors.canvas,
  },
  pillButtonSelected: {
    backgroundColor: tokens.colors.primaryMuted,
  },
  pillLabel: {
    flexShrink: 1,
    maxWidth: 140,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: uiWeight.semibold,
    color: uiColors.ink,
  },
  pillLabelSelected: {
    color: tokens.colors.primary,
  },
});

export default BuildingSelector;
