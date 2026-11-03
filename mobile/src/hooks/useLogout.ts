import { logout } from "@/api/auth/api";
import { RootStackParamList } from "@/navigation/types";
import { queryClient } from "@/services/queryClient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback } from "react";

/** Logs out, wipes every cached query and resets navigation to Login. */
export const useLogout = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return useCallback(async () => {
    try {
      await logout();
    } catch {
      // Local session is cleared regardless.
    }
    // Drop cached data of the previous account (cancels in-flight queries too)
    queryClient.clear();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }, [navigation]);
};
