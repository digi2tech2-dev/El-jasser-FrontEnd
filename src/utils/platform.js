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

/**
 * Native shells can load a newer hosted web bundle than the plugins packaged
 * in their APK. Treat plugin availability as a capability check, never as an
 * assumption based on the platform alone.
 */
export const isNativePluginAvailable = (pluginName) => {
  if (!isNativeApp() || typeof pluginName !== 'string' || !pluginName.trim()) return false;

  try {
    return typeof Capacitor.isPluginAvailable === 'function'
      && Capacitor.isPluginAvailable(pluginName);
  } catch {
    return false;
  }
};

export const isNativeGoogleAuthAvailable = () => (
  isAndroidNativeApp() && isNativePluginAvailable('NativeGoogleAuth')
);

export const isNativePushAvailable = () => (
  isAndroidNativeApp() && isNativePluginAvailable('PushNotifications')
);

export const isNativeAppInfoAvailable = () => (
  isAndroidNativeApp() && isNativePluginAvailable('App')
);
