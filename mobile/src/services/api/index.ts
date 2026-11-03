import { API_URL, PREFIX_URL } from "@/config";
import { queryClient } from "@/services/queryClient";
import { storage } from "@/utils/storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
// Cấu hình timeout
const TIMEOUT = 10000; // 10 giây

// Instance cho các request không cần authentication
export const publicApi = axios.create({
  baseURL: API_URL + PREFIX_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: TIMEOUT,
});

// Instance cho các request cần authentication
export const privateApi = axios.create({
  baseURL: API_URL + PREFIX_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: TIMEOUT,
});

// Instance chuyên cho upload file (multipart/form-data)
export const filePrivateApi = axios.create({
  baseURL: API_URL + PREFIX_URL,
  headers: {
    // Để undefined cho axios tự set boundary khi dùng FormData
    "Content-Type": undefined as any,
    Accept: "application/json",
  },
  timeout: TIMEOUT,
});

// export const filePrivateApi = axios.create({
//   baseURL: API_URL + PREFIX_URL,
//   headers: {
//     'Content-Type': 'multipart/form-data',
//     'Accept': 'application/json',
//   },
//   timeout: TIMEOUT,
// });

// Hàm kiểm tra kết nối mạng
const checkNetworkConnection = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected;
};

// Thêm interceptor để kiểm tra kết nối mạng
const networkInterceptor = async (config: any) => {
  const isConnected = await checkNetworkConnection();
  if (!isConnected) {
    throw new Error("NETWORK_ERROR");
  }
  return config;
};

publicApi.interceptors.request.use(networkInterceptor);
// Re-issue tokens so the JWT carries the latest per-property roles (e.g. after creating a property)
export const refreshSessionTokens = async () => {
  const refreshToken = await storage.getRefreshToken();
  const response = await publicApi.post("/auth/refresh-token", {
    refreshToken,
  });
  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  await storage.setAccessToken(accessToken);
  await storage.setRefreshToken(newRefreshToken);
};

privateApi.interceptors.request.use(networkInterceptor);
filePrivateApi.interceptors.request.use(networkInterceptor);

// Thêm interceptor để tự động thêm token vào header cho privateApi
privateApi.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý refresh token cho privateApi
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Xử lý timeout
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        response: {
          status: 408,
          data: {
            message: "Request timeout. Vui lòng thử lại.",
          },
        },
      });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await storage.getRefreshToken();
        const response = await publicApi.post("/auth/refresh-token", {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        await storage.setAccessToken(accessToken);
        await storage.setRefreshToken(newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return privateApi(originalRequest);
      } catch (error) {
        // Nếu refresh token thất bại, đăng xuất user
        await storage.removeTokens();
        queryClient.clear();
        // TODO: Chuyển về màn hình login
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

filePrivateApi.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);