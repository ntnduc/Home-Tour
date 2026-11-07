/**
 * MY INVITATIONS SCREEN — the invitee side: accept or decline property invitations.
 *
 * ```
 * ScreenHeader  ‹ Lời mời tham gia
 * ┌────────────────────────────────────────────┐ FormSection-like card
 * │ ▣ Nhà trọ Hoa Sen          [Chờ phản hồi]   │
 * │   Mời bởi Nguyễn Văn A · vai trò Quản lý    │
 * │   [ Từ chối ]  [ Chấp nhận ]                │
 * └────────────────────────────────────────────┘
 * ```
 * States: loading skeleton · error → SectionError · empty → EmptyState.
 */

import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import IconSquircle from "@/components/IconSquircle";
import ScreenHeader from "@/components/ScreenHeader";
import SectionError from "@/components/SectionError";
import SkeletonBlock from "@/components/SkeletonBlock";
import StatusBadge from "@/components/StatusBadge";
import { RootStackParamList } from "@/navigation/types";
import { refreshSessionTokens } from "@/services/api";
import { tokens, uiColors, uiSpace, uiType } from "@/theme";
import { useQueryClient } from "@tanstack/react-query";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useMyInvitations } from "./hooks/useMyInvitations";
import { roleLabel } from "./propertyMemberLabels";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MyInvitations">;
};

const MyInvitationsScreen = ({ navigation }: Props) => {
  const queryClient = useQueryClient();
  const {
    invitations,
    isLoading,
    isError,
    isRefreshing,
    refresh,
    respond,
    busyId,
  } = useMyInvitations();

  const handleRespond = async (id: string, accept: boolean) => {
    const ok = await respond(id, accept);
    if (ok && accept) {
      // New membership: refresh the JWT and the property lists
      await refreshSessionTokens().catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      Toast.show({ type: "success", text1: "Đã tham gia tài sản" });
    }
  };

  const renderBody = () => {
    if (isLoading)
      return [0, 1].map((i) => (
        <SkeletonBlock key={i} height={132} radius={24} />
      ));
    if (isError && invitations.length === 0) {
      return (
        <SectionError onRetry={refresh} message="Không tải được lời mời" />
      );
    }
    if (invitations.length === 0) {
      return (
        <EmptyState
          icon="mail-open-outline"
          title="Không có lời mời nào"
          description="Khi chủ tài sản mời bạn, lời mời sẽ hiện ở đây."
        />
      );
    }
    return invitations.map((invitation) => (
      <Card key={invitation.id} padding="md" style={styles.card}>
        <View style={styles.row}>
          <IconSquircle icon="business-outline" tone="primary" size="md" />
          <View style={styles.text}>
            <Text style={uiType.section} numberOfLines={1}>
              {invitation.propertyName}
            </Text>
            <Text style={uiType.caption} numberOfLines={2}>
              Mời bởi {invitation.invitedByName} · vai trò{" "}
              {roleLabel(invitation.roleName)}
            </Text>
          </View>
          <StatusBadge label="Chờ phản hồi" tone="warning" size="sm" />
        </View>
        <View style={styles.actions}>
          <Button
            label="Từ chối"
            variant="outline"
            block
            disabled={busyId === invitation.id}
            onPress={() => handleRespond(invitation.id, false)}
          />
          <Button
            label="Chấp nhận"
            icon="checkmark-circle"
            block
            isLoading={busyId === invitation.id}
            onPress={() => handleRespond(invitation.id, true)}
          />
        </View>
      </Card>
    ));
  };

  return (
    <SafeAreaView edges={[]} style={styles.screen}>
      <ScreenHeader
        title="Lời mời tham gia"
        onBack={() => navigation.goBack()}
        insetTop
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={tokens.colors.primary}
          />
        }
      >
        <View style={styles.list}>{renderBody()}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: uiColors.canvas },
  content: {
    paddingHorizontal: uiSpace.screen,
    paddingTop: 4,
    paddingBottom: 40,
    flexGrow: 1,
  },
  list: { gap: uiSpace.gap },
  card: { gap: uiSpace.gap },
  row: { flexDirection: "row", alignItems: "center", gap: uiSpace.gap },
  text: { flex: 1, gap: 2 },
  actions: { flexDirection: "row", gap: uiSpace.gap },
});

export default MyInvitationsScreen;
