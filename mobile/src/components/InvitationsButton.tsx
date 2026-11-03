import { getMyInvitations } from "@/api/property/propertyMember.api";
import { RootStackParamList } from "@/navigation/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import CountBadge from "./CountBadge";
import IconButton from "./IconButton";

/**
 * Header shortcut to "Lời mời tham gia": mail icon + red count badge of pending
 * property invitations. Hidden while there is none (or the query failed).
 * Shares the `["my-invitations"]` query with `useMyInvitations`.
 */
const InvitationsButton = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data } = useQuery({
    queryKey: ["my-invitations"],
    queryFn: async () => {
      const response = await getMyInvitations();
      if (!response.success || !response.data) {
        throw new Error(response.message ?? "Không tải được lời mời");
      }
      return response.data;
    },
    staleTime: 30_000,
  });

  if (!data || data.length === 0) return null;

  return (
    <View>
      <IconButton
        icon="mail-outline"
        tone="primary"
        accessibilityLabel={`Có ${data.length} lời mời tham gia`}
        onPress={() => navigation.navigate("MyInvitations")}
      />
      <CountBadge
        count={data.length}
        tone="error"
        size="sm"
        style={styles.badge}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { position: "absolute", top: -4, right: -4 },
});

export default InvitationsButton;
