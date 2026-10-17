import ActionButtonBottom from "@/components/ActionButtonBottom";
import EmptyState from "@/components/EmptyState";
import { uiColors, uiSpace } from "@/theme";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { RootStackParamList } from "../../navigation/types";

type CreateRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CreateRoom">;
  route: RouteProp<RootStackParamList, "CreateRoom">;
};

/** Placeholder until the create-room form is implemented. */
const CreateRoomScreen = ({ navigation, route }: CreateRoomScreenProps) => {
  const { propertyId } = route.params;

  const handleSave = () => {
    // TODO: Implement room creation logic
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <EmptyState
          icon="construct-outline"
          title="Form tạo phòng đang phát triển"
          description={`Tài sản: ${propertyId}`}
        />
      </ScrollView>
      <ActionButtonBottom
        actions={[{ label: "Lưu phòng", icon: "checkmark-circle", variant: "success", onPress: handleSave }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: uiColors.canvas,
  },
  content: {
    padding: uiSpace.screen,
  },
});

export default CreateRoomScreen;
