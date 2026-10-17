import { uiType } from "@/theme";
import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Card from "./Card";

type Props = {
  children: ReactNode;
  title?: string | ReactNode;
  description?: string | ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Simple titled card (title + optional description + content).
 * For form sections with an icon/action use `FormSection`.
 */
const CardContent = ({ children, title, description, style }: Props) => (
  <Card style={[styles.card, style]}>
    {(title || description) && (
      <View style={styles.header}>
        {typeof title === "string" ? <Text style={uiType.section}>{title}</Text> : title}
        {typeof description === "string" ? (
          <Text style={uiType.caption}>{description}</Text>
        ) : (
          description
        )}
      </View>
    )}
    {children}
  </Card>
);

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  header: {
    gap: 2,
  },
});

export default CardContent;
