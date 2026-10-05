import { registerPlugin } from '@capacitor/core';
import { isAndroidNativeApp } from '../utils/platform';

const NativeGoogleAuth = registerPlugin('NativeGoogleAuth');

const unavailableError = () => new Error('Native Google Sign-In is available only in the El-Jasser Android app.');

export const signInWithNativeGoogle = async () => {
  if (!isAndroidNativeApp()) throw unavailableError();
  const result = await NativeGoogleAuth.signIn();
  if (!result?.idToken) throw new Error('Google Sign-In did not return an ID token.');
  return result;
};

export const clearNativeGoogleCredentialState = async () => {
  if (!isAndroidNativeApp()) return;
  await NativeGoogleAuth.signOut();
};
