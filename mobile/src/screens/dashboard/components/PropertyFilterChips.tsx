import { tokens } from "@/theme";
import { HomepagePropertyOption } from "@/types/homepage";
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { HOME_RADIUS, HOME_SPACE, homeColors, homeWeight } from "../homeStyles";
import PressableScale from "./PressableScale";

type Props = {
  properties: HomepagePropertyOption[];
  selectedId?: string;
  onSelect: (id?: string) => void;
};

/**
 * Hàng chip lọc tài sản cuộn ngang ("Tất cả" + từng tài sản).
 * Chip đang chọn dùng nền mực đậm (độ tương phản cao), chip còn lại nền trắng viền mảnh.
 * Ẩn khi user chỉ có ≤ 1 tài sản (lọc không có ý nghĩa).
 */
const PropertyFilterChips = ({ properties, selectedId, onSelect }: Props) => {
  if (properties.length <= 1) return null;

  const options: { id?: string; name: string }[] = [
    { id: undefined, name: "Tất cả" },
    ...properties,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {options.map((option) => {
        const active = option.id === selectedId;
        return (
          <PressableScale
            key={option.id ?? "all"}
            onPress={() => onSelect(option.id)}
            style={[styles.chip, active && styles.chipActive]}
            scaleTo={0.94}
          >
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {option.name}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Kéo tràn mép màn hình để chip cuộn sát viền, nhưng vẫn thẳng hàng lề nội dung.
  scroll: { marginHorizontal: -HOME_SPACE.screen },
  content: { paddingHorizontal: HOME_SPACE.screen, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: HOME_RADIUS.pill,
    backgroundColor: homeColors.card,
    borderWidth: 1,
    borderColor: tokens.colors.borderStrong,
    maxWidth: 200,
  },
  chipActive: {
    backgroundColor: homeColors.ink,
    borderColor: homeColors.ink,
  },
  label: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: homeWeight.medium,
    color: homeColors.text,
  },
  labelActive: { color: tokens.colors.onInverse },
});

export default PropertyFilterChips;
