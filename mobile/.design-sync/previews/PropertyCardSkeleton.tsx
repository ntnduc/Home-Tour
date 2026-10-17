import React from "react";
import { PropertyCardSkeleton, View, propColors, PROP_SPACE } from "home-tour-mobile";
import { Phone } from "../preview-kit/fixtures";

export const Default = () => (
  <Phone bg={propColors.canvas}>
    <View style={{ gap: PROP_SPACE.gap }}>
      <PropertyCardSkeleton />
      <PropertyCardSkeleton />
    </View>
  </Phone>
);
