import ActionButtonBottom from "@/components/ActionButtonBottom";
import FormScreen from "@/components/FormScreen";
import FormSection from "@/components/FormSection";
import IconButton from "@/components/IconButton";
import { uiType } from "@/theme";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Text } from "react-native";
import { RootStackParamList } from "../../navigation/types";

type TenantDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "TenantDetail">;
  route: RouteProp<RootStackParamList, "TenantDetail">;
};

const TenantDetailScreen = ({ navigation, route }: TenantDetailScreenProps) => {
  const { tenantId } = route.params;

  const handleEditTenant = () => {
    navigation.navigate("UpdateTenant", { tenantId });
  };

  const handleCreateContract = () => {
    navigation.navigate("CreateContract", { roomId: "", tenantId });
  };

  return (
    <FormScreen
      footer={
        <ActionButtonBottom
          actions={[
            { label: "Tạo hợp đồng", icon: "document-text", onPress: handleCreateContract },
          ]}
        />
      }
    >
      <FormSection
        title="Thông tin cá nhân"
        icon="person-outline"
        action={
          <IconButton
            icon="create-outline"
            tone="primary"
            onPress={handleEditTenant}
            accessibilityLabel="Sửa khách thuê"
          />
        }
      >
        <Text style={uiType.caption}>Mã khách thuê: {tenantId}</Text>
      </FormSection>
    </FormScreen>
  );
};

export default TenantDetailScreen;
