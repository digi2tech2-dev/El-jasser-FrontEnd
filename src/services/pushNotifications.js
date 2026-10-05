import { PushNotifications } from '@capacitor/push-notifications';
import apiClient from './client';
import { isAndroidNativeApp } from '../utils/platform';

const PUSH_ACTION_EVENT = 'eljasser:push-action';
let initializationPromise = null;
let activeUserId = null;
let currentToken = null;
let listenersAttached = false;

const safeInternalRoute = (route) => (
  typeof route === 'string'
  && route.startsWith('/')
  && !route.startsWith('//')
  && !route.includes('://')
  && !route.includes('\\')
);

const registerTokenWithBackend = async (token) => {
  currentToken = token;
  await apiClient.devices.registerPush({ token, platform: 'android' });
};

const attachListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  void PushNotifications.addListener('registration', (token) => {
    if (!activeUserId || !token?.value) return;
    void registerTokenWithBackend(token.value).catch(() => {
      // A later registration event or app launch retries. Never block the app.
    });
  });

  void PushNotifications.addListener('registrationError', (error) => {
    console.warn('[Push] Native registration failed:', error?.error || 'unknown error');
  });

  // The existing in-app notification store remains the foreground UI. Do not
  // create a second toast here and duplicate an already-visible notification.
  void PushNotifications.addListener('pushNotificationReceived', () => {});

  void PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const route = action?.notification?.data?.route;
    if (!safeInternalRoute(route) || typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(PUSH_ACTION_EVENT, { detail: { route } }));
  });
};

export const initializeNativePush = async (userId) => {
  if (!isAndroidNativeApp() || !userId) return;
  if (initializationPromise && activeUserId === userId) return initializationPromise;

  activeUserId = userId;
  initializationPromise = (async () => {
    attachListeners();
    const permission = await PushNotifications.checkPermissions();
    const granted = permission.receive === 'granted'
      ? permission
      : await PushNotifications.requestPermissions();
    if (granted.receive !== 'granted') return;

    await PushNotifications.createChannel({
      id: 'eljasser_general',
      name: 'El-Jasser Notifications',
      description: 'Account and order updates from El-Jasser',
      importance: 3,
      visibility: 1,
      sound: 'default',
      vibration: true,
    });
    await PushNotifications.register();
  })().finally(() => {
    initializationPromise = null;
  });

  return initializationPromise;
};

export const unregisterNativePush = async () => {
  if (!isAndroidNativeApp()) return;
  const token = currentToken;
  activeUserId = null;
  currentToken = null;

  try {
    if (token) await apiClient.devices.unregisterPush({ token });
  } catch {
    // Logout remains available offline. A later account's registration safely
    // reassigns the globally-unique token before it receives notifications.
  }

  try {
    await PushNotifications.unregister();
  } catch {
    // Best effort only; backend ownership was already handled above.
  }
  await PushNotifications.removeAllListeners();
  listenersAttached = false;
};

export { PUSH_ACTION_EVENT };
