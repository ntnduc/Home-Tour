import React from "react";
import { SectionHeader, View } from "home-tour-mobile";
import { Phone, noop } from "../preview-kit/fixtures";

export const Variants = () => (
  <Phone>
    <View style={{ gap: 16 }}>
      <SectionHeader title="Thao tác nhanh" />
      <SectionHeader title="Cần xử lý" count={3} />
      <SectionHeader title="Phòng cần chú ý" actionLabel="Tất cả" onPressAction={noop} />
    </View>
  </Phone>
);
