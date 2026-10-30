/**
 * PROFILE SCREEN — Modern Minimalist.
 *
 * ```
 * ScreenHeader "Cá nhân"
 * ┌──────────────────────────────┐ canvas surfaceMuted · pull-to-refresh
 * │ ProfileHero (avatar · name)   │
 * │ THÔNG BÁO  card of 3 toggles  │ optimistic, rolled back on error
 * │ TÀI KHOẢN  card of rows       │ edit info · help · logout
 * │ Phiên bản                     │
 * └──────────────────────────────┘
 * ```
 * States: first load → hero skeleton · error w/o data → SectionError (retry) ·
 * background refetch → content dimmed · avatar upload → spinner on the photo.
 */
import { logout } from "@/api/auth/api";
import ListRow from "@/components/ListRow";
import ScreenHeader from "@/components/ScreenHeader";
import SectionError from "@/components/SectionError";
import { useTabBarInset } from "@/navigation/useTabBarInset";
import { RootStackParamList } from "@/navigation/types";
import { shadows, tokens, uiColors, uiRadius, uiSpace, uiType } from "@/theme";
import { ProfileSettings } from "@/types/profile";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { ActionSheetIOS, Alert, Platform, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileHero from "./components/ProfileHero";
import { useProfileData } from "./hooks/useProfileData";
import { pickAvatar } from "./profileAvatar";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const APP_VERSION = "1.0.0";

const SETTING_ROWS: {
  key: keyof ProfileSettings;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof ListRow>["icon"];
}[] = [
  { key: "invoiceReminder", title: "Nhắc hóa đơn", subtitle: "Nhắc khi hóa đơn sắp đến hạn", icon: "receipt-outline" },
  { key: "contractExpiryReminder", title: "Hợp đồng sắp hết hạn", subtitle: "Nhắc trước khi hợp đồng kết thúc", icon: "document-text-outline" },
  { key: "paymentReceived", title: "Thanh toán thành công", subtitle: "Báo khi nhận được thanh toán", icon: "cash-outline" },
];

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const tabInset = useTabBarInset();
  const data = useProfileData();
  const { profile } = data;
  const isAvatarBusy = data.isUploadingAvatar || data.isRemovingAvatar;

  const changeAvatar = async () => {
    const file = await pickAvatar();
    if (file) await data.uploadAvatar(file).catch(() => undefined);
  };

  const confirmRemoveAvatar = () =>
    Alert.alert("Xóa ảnh đại diện", "Bạn có chắc chắn muốn xóa ảnh đại diện?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => void data.removeAvatar().catch(() => undefined) },
    ]);

  const onPressAvatar = () => {
    if (!profile?.avatarFileId) return void changeAvatar();
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Chọn ảnh mới", "Xóa ảnh", "Hủy"], destructiveButtonIndex: 1, cancelButtonIndex: 2 },
        (index) => {
          if (index === 0) void changeAvatar();
          if (index === 1) confirmRemoveAvatar();
        },
      );
      return;
    }
    Alert.alert("Ảnh đại diện", undefined, [
      { text: "Chọn ảnh mới", onPress: () => void changeAvatar() },
      { text: "Xóa ảnh", style: "destructive", onPress: confirmRemoveAvatar },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  const handleLogout = () =>
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch {
            // Local session is cleared regardless.
          }
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.root} edges={[]}>
      <ScreenHeader title="Cá nhân" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: uiSpace.section + tabInset }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={data.isRefreshing}
            onRefresh={data.refresh}
            tintColor={tokens.colors.primary}
          />
        }
      >
        {data.isError ? (
          <SectionError onRetry={data.retry} message="Không tải được thông tin cá nhân" />
        ) : (
          <View style={[styles.stack, data.isFetching && !data.isRefreshing && !data.isLoading && styles.dimmed]}>
            <ProfileHero
              profile={profile}
              isLoading={data.isLoading}
              isBusy={isAvatarBusy}
              onPressAvatar={onPressAvatar}
            />

            <Text style={styles.eyebrow}>Thông báo</Text>
            <View style={[styles.group, shadows.soft]}>
              {SETTING_ROWS.map((row, index) => (
                <ListRow
                  key={row.key}
                  icon={row.icon}
                  title={row.title}
                  subtitle={row.subtitle}
                  divider={index > 0}
                  trailing={
                    <Switch
                      value={profile?.settings[row.key] ?? false}
                      disabled={!profile}
                      onValueChange={(value) => data.updateSettings({ [row.key]: value })}
                      trackColor={{ true: tokens.colors.primary }}
                      accessibilityLabel={row.title}
                    />
                  }
                />
              ))}
            </View>

            <Text style={styles.eyebrow}>Tài khoản</Text>
            <View style={[styles.group, shadows.soft]}>
              <ListRow
                icon="person-outline"
                title="Chỉnh sửa thông tin"
                subtitle="Họ tên, email"
                trailing="chevron"
                onPress={() => navigation.navigate("EditProfile")}
              />
              <ListRow icon="help-circle-outline" iconTone="info" title="Trợ giúp" divider trailing="chevron" onPress={() => undefined} />
              <ListRow icon="log-out-outline" title="Đăng xuất" destructive divider onPress={handleLogout} />
            </View>

            <Text style={[uiType.caption, styles.version]}>Phiên bản {APP_VERSION}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: uiColors.canvas },
  content: { paddingHorizontal: uiSpace.screen, paddingTop: 16 },
  stack: { gap: uiSpace.gap },
  dimmed: { opacity: 0.6 },
  eyebrow: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: uiColors.textMuted,
  },
  group: {
    borderRadius: uiRadius.card,
    backgroundColor: uiColors.card,
    overflow: "hidden",
  },
  version: { textAlign: "center", marginTop: 8 },
});

export default ProfileScreen;
