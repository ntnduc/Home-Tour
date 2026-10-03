import { Platform } from 'react-native';

// Địa chỉ IP của máy tính của bạn
const LOCAL_IP = 'localhost';

export const API_URL = Platform.select({
  ios: `http://${LOCAL_IP}:3000`,
  android: `http://${LOCAL_IP}:3000`,
  default: 'http://localhost:3000',
});
