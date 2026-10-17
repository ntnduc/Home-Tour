import { tokens, uiColors, uiRadius, uiWeight } from "@/theme";
import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";

/**
 * FORM FIELD LOOK — single definition shared by Input, ComboBox, DatePicker,
 * Switch and LabelForm, so every field in the app has the same anatomy:
 *
 * ```
 * Label *                                   14/20 semibold ink · asterisk error
 * ╭───────────────────────────────────────╮ min 48 · radius 14 · border gray200
 * │ ⓘ  value / placeholder            ✕  │ text 15/20 ink · icon 18 subtle
 * ╰───────────────────────────────────────╯ focus → primary · error → red · disabled → gray100
 * Error message                             12/16 error
 * ```
 */
export const fieldColors = {
  border: uiColors.fieldBorder,
  borderFocus: tokens.colors.primary,
  borderError: tokens.colors.error,
  bg: uiColors.card,
  bgError: tokens.palette.red[50],
  bgDisabled: uiColors.fieldDisabled,
  text: uiColors.ink,
  placeholder: uiColors.textSubtle,
  icon: uiColors.textSubtle,
} as const;

export const fieldStyles = StyleSheet.create({
  label: {
    fontSize: tokens.typography.fontSize.sm,
    lineHeight: tokens.typography.lineHeight.sm,
    fontWeight: uiWeight.semibold,
    color: uiColors.ink,
    marginBottom: 6,
  },
  required: {
    color: tokens.colors.error,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: uiRadius.field,
    borderWidth: 1,
    borderColor: fieldColors.border,
    backgroundColor: fieldColors.bg,
  },
  boxFocused: {
    borderColor: fieldColors.borderFocus,
  },
  boxError: {
    borderColor: fieldColors.borderError,
    backgroundColor: fieldColors.bgError,
  },
  boxDisabled: {
    backgroundColor: fieldColors.bgDisabled,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    color: fieldColors.text,
  },
  error: {
    fontSize: tokens.typography.fontSize.xs,
    lineHeight: tokens.typography.lineHeight.xs,
    color: tokens.colors.error,
    marginTop: 6,
  },
});

export interface FieldLabelProps {
  label: string;
  required?: boolean;
  style?: StyleProp<TextStyle>;
}

/** Field label with optional required asterisk. */
export const FieldLabel = ({ label, required, style }: FieldLabelProps) => (
  <Text style={[fieldStyles.label, style]}>
    {label}
    {required && <Text style={fieldStyles.required}> *</Text>}
  </Text>
);

/** Inline validation message under a field (renders nothing without a message). */
export const FieldError = ({ message }: { message?: string }) =>
  message ? <Text style={fieldStyles.error}>{message}</Text> : null;
