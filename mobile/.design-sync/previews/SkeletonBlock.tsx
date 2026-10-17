import React from "react";
import { SkeletonBlock, View, tokens } from "home-tour-mobile";
import { Phone } from "../preview-kit/fixtures";

export const Lines = () => (
  <Phone>
    <View style={{ gap: 10, backgroundColor: tokens.colors.surface, borderRadius: 24, padding: 20 }}>
      <SkeletonBlock width="60%" height={20} radius={8} />
      <SkeletonBlock width="90%" height={14} radius={6} />
      <SkeletonBlock width="40%" height={14} radius={6} />
    </View>
  </Phone>
);
