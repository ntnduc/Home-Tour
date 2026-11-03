/**
 * PROPERTY MEMBERS SCREEN — role & permission management for one property.
 *
 * ```
 * ScreenHeader  ‹ Thành viên & phân quyền           [ + ]   (+ opens the invite sheet)
 * ┌────────────────────────────────────────────┐
 * │ NoticeBanner: changes apply on next sign-in │
 * ├────────────────────────────────────────────┤
 * │ MemberAccordion (owner)        ⌄            │  collapsed by default
 * │ MemberAccordion (member)       ⌄            │
 * │ MemberAccordion (pending)      ⌄            │
 * └────────────────────────────────────────────┘
 * ```
 *
 * States: loading → skeleton cards · error → SectionError (retry) ·
 * no members → EmptyState · pull-to-refresh.
 */

import EmptyState from "@/components/EmptyState";
import IconButton from "@/components/IconButton";
import NoticeBanner from "@/components/NoticeBanner";
import ScreenHeader from "@/components/ScreenHeader";
import SectionError from "@/components/SectionError";
import SkeletonBlock from "@/components/SkeletonBlock";
import { useGlobalAppSheet } from "@/components/GlobalAppSheet";
import { RootStackParamList } from "@/navigation/types";
import { uiColors, uiSpace, tokens } from "@/theme";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InviteMemberSheet from "./components/InviteMemberSheet";
import MemberAccordion from "./components/MemberAccordion";
import { usePropertyMembersData } from "./hooks/usePropertyMembersData";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "PropertyMembers">;
  route: RouteProp<RootStackParamList, "PropertyMembers">;
};

const PropertyMembersScreen = ({ navigation, route }: Props) => {
  const { propertyId } = route.params;
  const { openAppSheet, closeAppSheet } = useGlobalAppSheet();
  const data = usePropertyMembersData(propertyId);

  const handleOpenInvite = () => {
    openAppSheet(
      <InviteMemberSheet onInvite={data.invite} onDone={closeAppSheet} />,
      {
        snapPoints: ["55%"],
        detached: false,
        header: { title: "Mời thành viên", onClose: closeAppSheet },
      },
    );
  };

  const header = (
    <ScreenHeader
      title="Thành viên & phân quyền"
      subtitle={
        data.isLoading ? undefined : `${data.members.length} thành viên`
      }
      onBack={() => navigation.goBack()}
      insetTop
      action={
        <IconButton
          icon="add"
          tone="primary"
          accessibilityLabel="Mời thành viên"
          onPress={handleOpenInvite}
        />
      }
    />
  );

  const renderBody = () => {
    if (data.isLoading) {
      return (
        <>
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} height={88} radius={24} />
          ))}
        </>
      );
    }
    if (data.isError && data.members.length === 0) {
      return (
        <SectionError
          onRetry={data.refresh}
          message="Không tải được danh sách thành viên"
        />
      );
    }
    if (data.members.length === 0) {
      return (
        <EmptyState
          icon="people-outline"
          title="Chưa có thành viên"
          description="Mời người dùng bằng số điện thoại để cùng quản lý tài sản này."
          actionLabel="Mời thành viên"
          onPressAction={handleOpenInvite}
        />
      );
    }
    return (
      <>
        <NoticeBanner
          tone="info"
          message="Quyền mới có hiệu lực khi thành viên làm mới phiên đăng nhập (đăng nhập lại hoặc mở lại ứng dụng)."
        />
        {data.members.map((member) => (
          <MemberAccordion
            key={`${member.status}-${member.userId}`}
            member={member}
            groups={data.groups}
            isSaving={data.isSaving}
            onToggle={data.togglePermission}
            onCancelInvitation={data.cancelInvitation}
            isCancelling={data.isCancelling}
          />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView edges={[]} style={styles.screen}>
      {header}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={data.isRefreshing}
            onRefresh={data.refresh}
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
});

export default PropertyMembersScreen;
