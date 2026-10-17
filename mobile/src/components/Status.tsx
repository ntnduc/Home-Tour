import { StatusTone } from "@/theme";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import StatusBadge, { StatusBadgeSize } from "./StatusBadge";

/** @deprecated alias of `StatusTone` — kept for older imports. */
export type StatusType = StatusTone;

/** One domain status value → label + tone. Visuals are owned by `StatusBadge`. */
export type StatusOption<V = string> = {
  value: V;
  label: string;
  type?: StatusTone;
};

type Props = {
  /** Direct mode: tone + label. */
  type?: StatusTone;
  label?: string;
  /** Lookup mode: render the option whose `value` matches. */
  options?: StatusOption[];
  value?: string | null;
  size?: StatusBadgeSize;
  style?: StyleProp<ViewStyle>;
};

/**
 * Domain-status adapter over `StatusBadge`.
 *
 * - `<Status value={contract.status} options={CONTRACT_STATUS_OPTIONS} />`
 * - `<Status type="success" label="Đang thuê" />`
 *
 * Renders nothing when the value has no matching option.
 */
const Status = ({ type, label, options, value, size, style }: Props) => {
  if (options && options.length > 0) {
    const option = value ? options.find((o) => o.value === value) : undefined;
    if (!option) return null;
    return <StatusBadge label={option.label} tone={option.type ?? "neutral"} size={size} style={style} />;
  }
  if (!label) return null;
  return <StatusBadge label={label} tone={type ?? "neutral"} size={size} style={style} />;
};

export default Status;
