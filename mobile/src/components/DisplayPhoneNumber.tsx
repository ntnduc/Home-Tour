import { formatPhoneNumber } from "@/utils/appUtil";
import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  /** @deprecated use `style`. */
  className?: string;
};

/** Text that formats a raw phone string (e.g. 0901234567 → 0901 234 567). */
const DisplayPhoneNumber = ({ children, style, className }: Props) => (
  <Text style={style} className={className}>
    {typeof children === "string" ? formatPhoneNumber(children) : children}
  </Text>
);

export default DisplayPhoneNumber;
