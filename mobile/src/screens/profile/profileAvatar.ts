import { AvatarFile } from "@/types/profile";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

/** Must match the backend `avatar` upload category (5MB, jpg/png/webp). */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const askPermission = async (): Promise<boolean> => {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;
  const next = current.canAskAgain
    ? await ImagePicker.requestMediaLibraryPermissionsAsync()
    : current;
  if (next.granted) return true;
  Alert.alert(
    "Cần quyền truy cập ảnh",
    "Vui lòng cho phép truy cập thư viện ảnh trong Cài đặt để đổi ảnh đại diện.",
    [
      { text: "Hủy", style: "cancel" },
      { text: "Mở Cài đặt", onPress: () => void Linking.openSettings() },
    ],
  );
  return false;
};

/**
 * Pick a square avatar from the library and validate type/size.
 * Returns `null` when cancelled, denied or invalid (user already notified).
 */
export const pickAvatar = async (): Promise<AvatarFile | null> => {
  if (!(await askPermission())) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const type = (asset.mimeType ?? "image/jpeg").toLowerCase();
  const ext = MIME_TO_EXT[type];
  if (!ext) {
    Alert.alert("Ảnh không hợp lệ", "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
    return null;
  }
  if (asset.fileSize && asset.fileSize > MAX_AVATAR_BYTES) {
    Alert.alert("Ảnh quá lớn", "Vui lòng chọn ảnh nhỏ hơn 5MB.");
    return null;
  }
  return { uri: asset.uri, type, name: `avatar_${Date.now()}.${ext}` };
};
