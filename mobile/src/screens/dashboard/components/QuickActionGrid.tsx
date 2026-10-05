import { tokens } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  HOME_RADIUS,
  HOME_SPACE,
  homeColors,
  homeShadow,
  homeWeight,
} from "../homeStyles";
import PressableScale from "./PressableScale";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type QuickAction = {
  key: string;
  label: string;
  icon: IoniconName;
  /** Màu nền ô icon — đặc, tương phản cao với icon trắng. */
  color: string;
  onPress: () => void;
};

type Props = { actions: QuickAction[] };

/**
 * LƯỚI THAO TÁC NHANH — 4 cột đối xứng (đối lập với bento bất đối xứng phía trên
 * để tạo nhịp "động – tĩnh"). Mỗi ô: squircle màu đặc + icon trắng (tương phản cao)
 * đặt trên card trắng, nhãn 2 dòng tối đa bên dưới.
 */
const QuickActionGrid = ({ actions }: Props) => (
  <View style={styles.grid}>
    {actions.map((action) => (
      <PressableScale
        key={action.key}
        onPress={action.onPress}
        style={[styles.tile, homeShadow.soft]}
        scaleTo={0.93}
        accessibilityRole="button"
        accessibilityLabel={action.label}
      >
        <View style={[styles.icon, { backgroundColor: action.color }]}>
          <Ionicons
            name={action.icon}
            size={22}
            color={tokens.colors.onPrimary}
          />
        </View>
        <Text style={styles.label} numberOfLines={2}>
          {action.label}
        </Text>
      </PressableScale>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: { flexDirection: "row", gap: HOME_SPACE.gap - 2 },
  tile: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: HOME_RADIUS.tile,
    backgroundColor: homeColors.card,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: HOME_RADIUS.icon,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
    color: homeColors.ink,
    fontWeight: homeWeight.semibold,
  },
});

export default QuickActionGrid;
