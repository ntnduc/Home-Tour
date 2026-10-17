import React from "react";
import { AddButton, View } from "home-tour-mobile";
import { Phone, noop } from "../preview-kit/fixtures";

export const Variants = () => (
  <Phone>
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      <AddButton onPress={noop} label="Thêm" variant="solid" />
      <AddButton onPress={noop} label="Thêm" variant="soft" />
      <AddButton onPress={noop} label="Thêm phòng" icon="bed-outline" variant="soft" />
    </View>
  </Phone>
);
