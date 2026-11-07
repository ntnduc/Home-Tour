import PressableScale from "@/components/PressableScale";
import SkeletonBlock from "@/components/SkeletonBlock";
import { getFileUrl } from "@/components/Uploadfile/uploadfile.api";
import { Profile } from "@/types/profile";
import { shadows, tokens, uiColors, uiRadius, uiSpace, uiType, uiWeight } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

const AVATAR_SIZE = 88;

interface ProfileHeroProps {
  profile?: Profile;
  isLoading: boolean;
  /** Avatar upload / removal in flight → spinner over the photo. */
  isBusy: boolean;
  onPressAvatar: () => void;
}

const initialOf = (name?: string) => (name?.trim().charAt(0) || "?").toUpperCase();

/**
 * Identity card.
 * ```
 * ┌──────────────────────────────┐ Card soft · radius 24
 * │          ( avatar 88 )  [📷] │ tap avatar → change / remove
 * │          Full name           │
 * │          0900 000 000        │
 * │          email (if set)      │
 * └──────────────────────────────┘
 * ```
 * Loading → skeleton of the same shape.
 */
const ProfileHero = ({ profile, isLoading, isBusy, onPressAvatar }: ProfileHeroProps) => {
  if (isLoading && !profile) {
    return (
      <View style={[styles.card, shadows.soft]}>
        <SkeletonBlock width={AVATAR_SIZE} height={AVATAR_SIZE} radius={AVATAR_SIZE / 2} />
        <SkeletonBlock width={160} height={20} radius={8} />
        <SkeletonBlock width={110} height={14} radius={6} />
      </View>
    );
  }

  return (
    <View style={[styles.card, shadows.soft]}>
      <PressableScale
        onPress={onPressAvatar}
        scaleTo={0.94}
        disabled={isBusy}
        accessibilityRole="button"
        accessibilityLabel="Đổi ảnh đại diện"
      >
        <View style={styles.avatar}>
          {profile?.avatarFileId ? (
            <Image
              source={{ uri: getFileUrl(profile.avatarFileId) }}
              style={styles.image}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <Text style={styles.initial}>{initialOf(profile?.fullName)}</Text>
          )}
          {isBusy && (
            <View style={styles.busy}>
              <ActivityIndicator color={tokens.colors.onPrimary} />
            </View>
          )}
        </View>
        <View style={styles.badge}>
          <Ionicons name="camera" size={14} color={tokens.colors.onPrimary} />
        </View>
      </PressableScale>

      <View style={styles.info}>
        <Text style={uiType.section} numberOfLines={1}>
          {profile?.fullName || "Chưa cập nhật"}
        </Text>
        <Text style={uiType.caption}>{profile?.phone || "Chưa cập nhật"}</Text>
        {profile?.email ? <Text style={uiType.caption}>{profile.email}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: 14,
    padding: uiSpace.hero,
    borderRadius: uiRadius.card,
    backgroundColor: uiColors.card,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.primaryMuted,
  },
  image: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  initial: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: uiWeight.bold,
    color: tokens.colors.primary,
  },
  busy: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: uiColors.ink,
    opacity: 0.45,
  },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.primary,
    borderWidth: 2,
    borderColor: uiColors.card,
  },
  info: { alignItems: "center", gap: 2 },
});

export default ProfileHero;
