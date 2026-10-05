import { Capacitor } from '@capacitor/core';

export const isNativeApp = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const isAndroidNativeApp = () => {
  try {
    return isNativeApp() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
};
