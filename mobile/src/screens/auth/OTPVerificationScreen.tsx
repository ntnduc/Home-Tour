import { tokens } from "@/theme";
import { requestOTP, verifyOTP } from '@/api/auth/api';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  Login: undefined;
  OTPVerification: { phoneNumber: string };
  RoomList: undefined;
  MainTabs: undefined;
  Register: { registrationToken: string };
};

type OTPVerificationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'OTPVerification'
>;

const OTPVerificationScreen = ({
  navigation,
  route,
}: OTPVerificationScreenProps) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP (6 số).');
      return;
    }
    setIsLoading(true);
    try {
      const response = await verifyOTP(phoneNumber, otpString);
      const data = response.data;
      if (!data.isRegistered && data.tempToken) {
        navigation.replace('Register', {
          registrationToken: data.tempToken,
        });
      } else {
        await storage.setAccessToken(data.accessToken);
        await storage.setRefreshToken(data.refreshToken);
        await storage.setUser(data.user);
        navigation.replace('MainTabs');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error?.error?.message ?? 'Mã OTP không đúng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) return;
    setIsLoading(true);
    try {
      await requestOTP(phoneNumber);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi.');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={48}
          color={tokens.colors.primary}
          style={{ alignSelf: 'center', marginBottom: 8 }}
        />
        <Text style={styles.title}>Xác thực OTP</Text>
        <Text style={styles.subtitle}>
          Nhập mã xác thực gồm 6 số đã gửi đến{'\n'}
          <Text style={{ color: tokens.colors.primary, fontWeight: 'bold' }}>
            {phoneNumber}
          </Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref as TextInput;
              }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : {}]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.resendButton,
              timeLeft > 0 && styles.resendButtonDisabled,
            ]}
            onPress={handleResendOTP}
            disabled={timeLeft > 0 || isLoading}
          >
            <Text style={styles.resendButtonText}>
              {timeLeft > 0
                ? `Gửi lại mã sau ${timeLeft}s`
                : 'Gửi lại mã xác thực'}
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: tokens.colors.foreground,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: tokens.colors.muted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1.5,
    borderColor: tokens.palette.gray[300],
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    color: tokens.colors.foreground,
    backgroundColor: tokens.colors.surfaceMuted,
  },
  otpInputFilled: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primaryMuted,
  },
  button: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: { backgroundColor: tokens.palette.gray[400] },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomButtonsContainer: {
    marginTop: 24,
    gap: 16,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendButtonDisabled: { opacity: 0.5 },
  resendButtonText: {
    color: tokens.colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    color: tokens.colors.muted,
    fontSize: 15,
    fontWeight: '500',
    fontStyle: 'italic',
    marginLeft: 4,
  },
});

export default OTPVerificationScreen;
