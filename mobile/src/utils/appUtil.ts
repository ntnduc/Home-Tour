import { checkLogin as checkLoginApi } from '@/api/auth/api';
import { User } from '@/types/user';
import { clsx, type ClassValue } from 'clsx';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';
import { twMerge } from 'tailwind-merge';
import { storage } from './storage';

export const getStoreUser = async (): Promise<User | undefined> => {
  return await storage.getUser();
};

export const checkLogin = async (): Promise<boolean> => {
  const accessToken = await storage.getAccessToken();
  const user = await storage.getUser();
  if (!accessToken || !user) {
    return false;
  }
  const reponse = await checkLoginApi();
  if (reponse.data?.isLoggedIn) {
    return true;
  }
  return false;
};

export const formatCurrency = (value: string | number) => {
  const stringValue = typeof value === 'number' ? value.toString() : value;
  const integerPart = stringValue.split(/[.,]/)[0].replace(/\D/g, '');
  return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const generateId = () => {
  return uuid.v4();
};

export const formatPhoneNumber = (phoneNumber: string) => {
  let digits = phoneNumber.replace(/\D/g, '');

  if (digits.startsWith('84')) {
    digits = '0' + digits.substring(2);
  }
  return digits.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
};

export const getCurrentOS = () => {
  return Platform.OS;
};

export const isIOSSystem = () => {
  return getCurrentOS() === 'ios';
};

export const isAndroidSystem = () => {
  return getCurrentOS() === 'android';
};

export const cn = (...classes: ClassValue[]) => {
  return twMerge(clsx(classes));
};