import React from "react";
import { QuickActionGrid, tokens, homeColors } from "home-tour-mobile";
import { Phone, noop } from "../preview-kit/fixtures";

export const Default = () => (
  <Phone>
    <QuickActionGrid
      actions={[
        { key: "add-property", label: "Thêm tài sản", icon: "add", color: tokens.colors.primary, onPress: noop },
        { key: "rooms", label: "Phòng", icon: "bed-outline", color: homeColors.ink, onPress: noop },
        { key: "contracts", label: "Hợp đồng", icon: "document-text-outline", color: tokens.colors.success, onPress: noop },
        { key: "invoices", label: "Hóa đơn", icon: "receipt-outline", color: tokens.palette.amber[500], onPress: noop },
      ]}
    />
  </Phone>
);
