import { tokens } from "@/theme";
import { register } from "@/api/auth/api";
import { storage } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RootStackParamList = {
  Login: undefined;
  OTPVerification: { phoneNumber: string };
  RoomList: undefined;
  MainTabs: undefined;
  Register: { registrationToken: string };
};

type RegisterScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Register"
>;

const RegisterScreen = ({ navigation, route }: RegisterScreenProps) => {
  const { registrationToken } = route.params;
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên của bạn.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await register(registrationToken, fullName);
      const data = response.data;
      // Lưu token vào AsyncStorage
      await storage.setAccessToken(data.accessToken);
      await storage.setRefreshToken(data.refreshToken);
      await storage.setUser(data.user);
      navigation.navigate("MainTabs");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Ionicons
          name="person-add-outline"
          size={48}
          color={tokens.colors.primary}
          style={{ alignSelf: "center", marginBottom: 8 }}
        />
        <Text style={styles.title}>Hoàn tất đăng ký</Text>
        <Text style={styles.subtitle}>
          Vui lòng nhập họ tên của bạn để hoàn tất đăng ký
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Đang xử lý..." : "Hoàn tất"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContent}>
            <Ionicons name="chevron-back" size={18} color={tokens.colors.muted} />
            <Text style={styles.backButtonText}>Quay lại</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  backButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    color: tokens.colors.muted,
    fontSize: 15,
    fontWeight: "500",
    fontStyle: "italic",
    marginLeft: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: tokens.colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: tokens.colors.muted,
    textAlign: "center",
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 2,
    borderColor: tokens.palette.gray[300],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: tokens.colors.surfaceMuted,
  },
  button: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: tokens.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: tokens.palette.gray[400] },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default RegisterScreen;
