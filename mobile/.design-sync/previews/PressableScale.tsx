import React from "react";
import { PressableScale, Text, View, Ionicons, tokens, shadows } from "home-tour-mobile";
import { Phone, noop } from "../preview-kit/fixtures";

/** Tap target used for every pressable surface (cards, chips, buttons). */
export const Card = () => (
  <Phone>
    <PressableScale onPress={noop} style={[{ backgroundColor: tokens.colors.surface, borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", gap: 12 }, shadows.soft]}>
      <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: tokens.colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="business-outline" size={22} color={tokens.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: tokens.colors.foreground }}>Nhà trọ Hòa Bình</Text>
        <Text style={{ fontSize: 13, color: tokens.colors.muted }}>12/16 phòng đã thuê</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={tokens.colors.subtle} />
    </PressableScale>
  </Phone>
);
