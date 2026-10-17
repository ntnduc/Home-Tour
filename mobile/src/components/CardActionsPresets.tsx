import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { IconTone } from "./IconSquircle";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/** Visual + a11y definition of a standard card action. Styling is owned by `IconButton`. */
export type CardActionPreset = {
  icon: IoniconName;
  tone: IconTone | "ink";
  label: string;
};

export type CardActionPresetKey = "view" | "renew" | "terminate" | "edit" | "delete";

export const CARD_ACTION_PRESETS: Record<CardActionPresetKey, CardActionPreset> = {
  view: { icon: "eye-outline", tone: "primary", label: "Xem" },
  renew: { icon: "refresh-outline", tone: "success", label: "Gia hạn" },
  terminate: { icon: "close-outline", tone: "error", label: "Chấm dứt" },
  edit: { icon: "create-outline", tone: "ink", label: "Sửa" },
  delete: { icon: "trash-outline", tone: "error", label: "Xoá" },
};

export const isCardActionPresetKey = (key: string): key is CardActionPresetKey =>
  key in CARD_ACTION_PRESETS;
