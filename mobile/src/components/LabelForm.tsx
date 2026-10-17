import React from "react";
import { StyleProp, TextStyle } from "react-native";
import { FieldLabel } from "./FormField";

export interface LabelProps {
  label: string;
  required?: boolean;
  labelStyles?: StyleProp<TextStyle>;
}

/** Form label for custom fields — same look as Input/ComboBox labels (`FieldLabel`). */
const LabelForm = ({ label, required, labelStyles }: LabelProps) => (
  <FieldLabel label={label} required={required} style={labelStyles} />
);

export default LabelForm;
