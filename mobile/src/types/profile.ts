export interface ProfileSettings {
  invoiceReminder: boolean;
  contractExpiryReminder: boolean;
  paymentReceived: boolean;
}

export interface Profile {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  /** FileEntry id; build the URL with `getFileUrl`. */
  avatarFileId: string | null;
  settings: ProfileSettings;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  /** `null` clears the email. */
  email?: string | null;
}

/** Local image picked from the library, ready to upload. */
export interface AvatarFile {
  uri: string;
  name: string;
  type: string;
}
