import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from "@/constant/service.constant";
import { createStyles } from "@/styles/StyleCreateTenantScreen";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { tokens } from "@/theme";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const CalculatorMethodComponent = ({
  value,
  onChange,
}: {
  value: ServiceCalculateMethod;
  onChange: (value: ServiceCalculateMethod) => void;
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="gap-2">
      <Text
        style={[
          styles.label,
          {
            marginTop: 12,
            marginBottom: 0,
            textAlign: "center",
          },
        ]}
      >
        Cách tính tiền
      </Text>
      <View className="gap-2">
        <TouchableOpacity
          style={[
            styles.calculationMethodButton,
            styles.calculationMethodButtonActive,
          ]}
          onPress={() => onChange(value)}
        >
          <View className="flex-row gap-3 items-center flex-1">
            <Ionicons
              name={SERVICE_CALCULATE_METHOD_WITH_INFO[value].icon}
              size={20}
              color="#fff"
            />
            <Text style={[styles.methodTitle, styles.methodTitleActive]}>
              {SERVICE_CALCULATE_METHOD_WITH_INFO[value].label}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.methodDetailButton}
            onPress={() => {
              Alert.alert(
                "Thông tin",
                SERVICE_CALCULATE_METHOD_WITH_INFO[value].info
              );
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <>
            {Object.values(ServiceCalculateMethod)
              .filter((method) => method !== value)
              .map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[styles.calculationMethodButton]}
                  onPress={() => {
                    onChange(method);
                  }}
                >
                  <View className="flex-row gap-3 items-center flex-1">
                    <Ionicons
                      name={SERVICE_CALCULATE_METHOD_WITH_INFO[method].icon}
                      size={20}
                      color={tokens.colors.primary}
                    />
                    <Text style={[styles.methodTitle]}>
                      {SERVICE_CALCULATE_METHOD_WITH_INFO[method].label}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.methodDetailButton}
                    onPress={() => {
                      Alert.alert(
                        "Thông tin",
                        SERVICE_CALCULATE_METHOD_WITH_INFO[method].info
                      );
                    }}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color={tokens.colors.muted}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
          </>
        )}

        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View className="flex-row gap-2 items-center justify-center">
            <Text style={styles.expandButtonText}>
              {isExpanded ? "Thu gọn" : "Xem thêm"}
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={tokens.colors.primary}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CalculatorMethodComponent;
