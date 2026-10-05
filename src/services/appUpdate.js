import { App } from '@capacitor/app';
import { isAndroidNativeApp, isNativeAppInfoAvailable } from '../utils/platform';
import {
  decideAndroidUpdate,
  getReleaseNotesForLanguage,
  LEGACY_VERSION_CODE,
  validateAndroidReleaseManifest,
} from './appUpdatePolicy.mjs';

export {
  decideAndroidUpdate,
  getReleaseNotesForLanguage,
  isSafeAndroidApkUrl,
  validateAndroidReleaseManifest,
} from './appUpdatePolicy.mjs';

export const ANDROID_RELEASE_MANIFEST_URL = '/downloads/android/latest.json';
const none = () => ({ status: 'none' });

const getInstalledAndroidVersion = async () => {
  if (!isNativeAppInfoAvailable()) {
    return { legacy: true, versionCode: LEGACY_VERSION_CODE, versionName: 'legacy' };
  }

  try {
    const info = await App.getInfo();
    const versionCode = Number.parseInt(String(info?.build || ''), 10);
    if (!Number.isInteger(versionCode) || versionCode < 1) return null;
    return { legacy: false, versionCode, versionName: String(info?.version || 'unknown') };
  } catch {
    // A new APK with a transient bridge failure should not be mistaken for an
    // older one and accidentally receive a mandatory prompt.
    return null;
  }
};

export const fetchAndroidReleaseManifest = async () => {
  try {
    const response = await fetch(ANDROID_RELEASE_MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) return null;
    return validateAndroidReleaseManifest(await response.json());
  } catch {
    return null;
  }
};

export const checkForAndroidUpdate = async () => {
  if (!isAndroidNativeApp()) return none();

  const manifest = await fetchAndroidReleaseManifest();
  if (!manifest) return none();

  const installed = await getInstalledAndroidVersion();
  if (!installed) return none();

  return decideAndroidUpdate({
    installedVersionCode: installed.versionCode,
    installedVersionName: installed.versionName,
    legacy: installed.legacy,
    manifest,
  });
};
