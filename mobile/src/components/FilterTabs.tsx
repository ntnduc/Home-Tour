import { shadows, tokens, uiColors, uiRadius, uiWeight } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Chip from "./Chip";
import PressableScale from "./PressableScale";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface FilterTab {
  key: string;
  title: string;
  icon?: IoniconName;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  /**
   * `segmented` (default): equal-width segments in a muted track.
   * `pill`: horizontally scrolling filter chips.
   */
  variant?: "segmented" | "pill";
}

/**
 * Tab / filter switcher.
 *
 * ```
 * segmented: ╭─────────────────────────────────╮  track canvas · radius pill
 *            │ (  Tuần  ) Tháng     Năm         │  active = white pill + soft shadow
 *            ╰─────────────────────────────────╯
 * pill:      (Tất cả) (Đã thanh toán) (Chờ) →     Chip filter, selected = ink
 * ```
 */
const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
  variant = "segmented",
}) => {
  if (variant === "pill") {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {tabs.map((tab) => (
          <Chip
            key={tab.key}
            label={tab.title}
            icon={tab.icon}
            variant="outline"
            selected={tab.key === activeTab}
            onPress={() => onTabPress(tab.key)}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.track}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <PressableScale
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            scaleTo={0.96}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && [styles.segmentActive, shadows.soft]]}
          >
            {tab.icon && (
              <Ionicons
                name={tab.icon}
                size={14}
                color={active ? uiColors.ink : uiColors.textMuted}
              />
            )}
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {tab.title}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  pillRow: {
    gap: 8,
  },
  track: {
    flexDirection: "row",
    padding: 4,
    borderRadius: uiRadius.pill,
    backgroundColor: tokens.palette.gray[100],
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 36,
    borderRadius: uiRadius.pill,
  },
  segmentActive: {
    backgroundColor: uiColors.card,
  },
  label: {
    fontSize: 13,
    fontWeight: uiWeight.semibold,
    color: uiColors.textMuted,
  },
  labelActive: {
    color: uiColors.ink,
  },
});

export default FilterTabs;
