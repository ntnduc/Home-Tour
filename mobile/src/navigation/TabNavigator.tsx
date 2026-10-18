import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform } from "react-native";
import PlatformTabBar from "@/components/PlatformTabBar";
import ContractListScreen from "../screens/contract/ContractListScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import PropertyListScreen from "../screens/property/PropertyListScreen";
import ReportScreen from "../screens/report/ReportScreen";
import RoomListScreen from "../screens/room/RoomListScreen";
import TestScreen from "../screens/test/TestScreen";
import { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <PlatformTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        // iOS: quick cross-fade between tab scenes; Android keeps its instant switch.
        animation: Platform.OS === "ios" ? "fade" : "none",
        // Selected tab uses the filled glyph (outline when idle), as on native iOS / Material 3.
        tabBarIcon: ({ color, size, focused }) => {
          switch (route.name) {
            case "Dashboard":
              return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
            case "Properties":
              return (
                <MaterialIcons name="apartment" size={size} color={color} />
              );
            case "Rooms":
              return (
                <FontAwesome5 name="door-open" size={size} color={color} />
              );
            case "Contracts":
              return (
                <Ionicons
                  name={focused ? "document-text" : "document-text-outline"}
                  size={size}
                  color={color}
                />
              );
            case "Reports":
              return (
                <Ionicons
                  name={focused ? "bar-chart" : "bar-chart-outline"}
                  size={size}
                  color={color}
                />
              );
            case "Profile":
              return (
                <Ionicons
                  name={focused ? "person-circle" : "person-circle-outline"}
                  size={size}
                  color={color}
                />
              );
            case "TestScreen":
              return <Ionicons name="telescope" size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Trang chủ" }}
      />
      <Tab.Screen
        name="Properties"
        component={PropertyListScreen}
        options={{ title: "Tài sản" }}
      />
      <Tab.Screen
        name="Rooms"
        component={RoomListScreen}
        options={{ title: "Phòng" }}
      />
      <Tab.Screen
        name="Contracts"
        component={ContractListScreen}
        options={{ title: "Hợp đồng" }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportScreen}
        options={{ title: "Báo cáo" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Cá nhân" }}
      />
      <Tab.Screen
        name="TestScreen"
        component={TestScreen}
        options={{ title: "Test Screen" }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
