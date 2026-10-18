import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { Platform } from "react-native";

/**
 * Extra bottom space a tab screen must reserve so its last item can scroll above the tab bar.
 *
 * iOS: the floating tab bar overlays content, so this is its measured height (incl. safe area).
 * Android: the bar sits in the layout and already pushes content up → 0.
 * Outside a tab navigator (e.g. the same screen pushed on a stack) → 0.
 */
export const useTabBarInset = (): number => {
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  return Platform.OS === "ios" ? tabBarHeight : 0;
};
