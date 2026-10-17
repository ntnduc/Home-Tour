/**
 * Navigation type for PropertyListScreen.
 *
 * The screen is mounted both as:
 *  1. The `Properties` tab in `TabParamList`
 *  2. A stack route `PropertyList` in `RootStackParamList`
 *
 * `CompositeNavigationProp` allows navigation to both tab and stack routes.
 */

import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "@/navigation/types";

export type PropertyListNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Properties">,
  NativeStackNavigationProp<RootStackParamList>
>;
