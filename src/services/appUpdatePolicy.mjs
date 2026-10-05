export const LEGACY_VERSION_CODE = 0;

const none = () => ({ status: 'none' });

const isIntegerAtLeast = (value, minimum) => (
  Number.isInteger(value) && value >= minimum
);

const normalizeReleaseNotes = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.entries(value).reduce((notes, [language, entries]) => {
    if (!Array.isArray(entries)) return notes;
    const safeEntries = entries
      .filter((entry) => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (safeEntries.length) notes[language] = safeEntries;
    return notes;
  }, {});
};

/** Only accept internal, same-origin APK paths from release metadata. */
export const isSafeAndroidApkUrl = (value, origin = (typeof window !== 'undefined' ? window.location.origin : 'https://invalid.local')) => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return false;

  try {
    const url = new URL(value, origin);
    return url.origin === origin
      && url.pathname.startsWith('/downloads/android/')
      && url.pathname.toLowerCase().endsWith('.apk');
  } catch {
    return false;
  }
};

/** Converts untrusted JSON into the only manifest shape used by the UI. */
export const validateAndroidReleaseManifest = (manifest) => {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return null;
  if (manifest.platform !== 'android' || manifest.appId !== 'com.eljasser.app') return null;
  if (!isIntegerAtLeast(manifest.versionCode, 1) || !isIntegerAtLeast(manifest.minSupportedVersionCode, 0)) return null;
  if (manifest.minSupportedVersionCode > manifest.versionCode) return null;
  if (typeof manifest.versionName !== 'string' || !manifest.versionName.trim()) return null;
  if (manifest.forceUpdate !== undefined && typeof manifest.forceUpdate !== 'boolean') return null;
  if (manifest.legacyForceUpdate !== undefined && typeof manifest.legacyForceUpdate !== 'boolean') return null;
  if (!isSafeAndroidApkUrl(manifest.apkUrl)) return null;
  if (manifest.sizeBytes !== undefined && !isIntegerAtLeast(manifest.sizeBytes, 0)) return null;
  if (manifest.sha256 !== undefined && (typeof manifest.sha256 !== 'string' || (manifest.sha256 && !/^[a-fA-F0-9]{64}$/.test(manifest.sha256)))) return null;
  if (manifest.publishedAt !== undefined && Number.isNaN(Date.parse(manifest.publishedAt))) return null;

  return {
    platform: 'android',
    appId: 'com.eljasser.app',
    versionCode: manifest.versionCode,
    versionName: manifest.versionName.trim(),
    minSupportedVersionCode: manifest.minSupportedVersionCode,
    forceUpdate: manifest.forceUpdate === true,
    // This explicit opt-in prevents a new manifest from unexpectedly locking
    // users of APKs that predate the App plugin.
    legacyForceUpdate: manifest.legacyForceUpdate === true,
    apkUrl: manifest.apkUrl,
    publishedAt: manifest.publishedAt || null,
    sizeBytes: manifest.sizeBytes ?? null,
    sha256: manifest.sha256 || '',
    releaseNotes: normalizeReleaseNotes(manifest.releaseNotes),
  };
};

/** Pure update policy, kept independent of Capacitor and UI. */
export const decideAndroidUpdate = ({ installedVersionCode, installedVersionName, legacy = false, manifest } = {}) => {
  const latest = validateAndroidReleaseManifest(manifest);
  if (!latest) return none();

  if (legacy) {
    return {
      status: latest.legacyForceUpdate ? 'required' : 'optional',
      installedVersionCode: LEGACY_VERSION_CODE,
      installedVersionName: 'legacy',
      latestVersionCode: latest.versionCode,
      latestVersionName: latest.versionName,
      apkUrl: latest.apkUrl,
      releaseNotes: latest.releaseNotes,
      legacy: true,
    };
  }

  if (!isIntegerAtLeast(installedVersionCode, 1) || installedVersionCode >= latest.versionCode) return none();

  return {
    status: latest.forceUpdate || installedVersionCode < latest.minSupportedVersionCode ? 'required' : 'optional',
    installedVersionCode,
    installedVersionName: typeof installedVersionName === 'string' && installedVersionName.trim()
      ? installedVersionName.trim()
      : 'unknown',
    latestVersionCode: latest.versionCode,
    latestVersionName: latest.versionName,
    apkUrl: latest.apkUrl,
    releaseNotes: latest.releaseNotes,
    legacy: false,
  };
};

export const getReleaseNotesForLanguage = (releaseNotes, language) => {
  const languageKey = String(language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
  return releaseNotes?.[languageKey] || releaseNotes?.ar || releaseNotes?.en || [];
};
