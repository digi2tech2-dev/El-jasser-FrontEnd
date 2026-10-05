import test from 'node:test';
import assert from 'node:assert/strict';
import { decideAndroidUpdate, isSafeAndroidApkUrl, validateAndroidReleaseManifest } from './appUpdatePolicy.mjs';

const manifest = (overrides = {}) => ({
  platform: 'android',
  appId: 'com.eljasser.app',
  versionCode: 4,
  versionName: '1.3.0',
  minSupportedVersionCode: 3,
  forceUpdate: false,
  apkUrl: '/downloads/android/el-jasser-1.3.0.apk',
  ...overrides,
});

test('does not update when installed build equals latest build', () => {
  assert.equal(decideAndroidUpdate({ installedVersionCode: 3, manifest: manifest({ versionCode: 3 }) }).status, 'none');
});

test('offers optional update for a supported installed build', () => {
  assert.equal(decideAndroidUpdate({ installedVersionCode: 3, manifest: manifest() }).status, 'optional');
});

test('requires update below the minimum supported build', () => {
  assert.equal(decideAndroidUpdate({ installedVersionCode: 2, manifest: manifest() }).status, 'required');
});

test('requires a forced update', () => {
  assert.equal(decideAndroidUpdate({ installedVersionCode: 3, manifest: manifest({ forceUpdate: true }) }).status, 'required');
});

test('legacy APK ignores normal forceUpdate unless legacyForceUpdate is enabled', () => {
  assert.equal(decideAndroidUpdate({ legacy: true, manifest: manifest({ forceUpdate: false, legacyForceUpdate: false }) }).status, 'optional');
  assert.equal(decideAndroidUpdate({ legacy: true, manifest: manifest({ forceUpdate: true, legacyForceUpdate: false }) }).status, 'optional');
  assert.equal(decideAndroidUpdate({ legacy: true, manifest: manifest({ forceUpdate: false, legacyForceUpdate: true }) }).status, 'required');
  assert.equal(decideAndroidUpdate({ legacy: true, manifest: manifest({ forceUpdate: true, legacyForceUpdate: true }) }).status, 'required');
});

test('known old APK requires a normal forced update', () => {
  assert.equal(decideAndroidUpdate({ installedVersionCode: 3, manifest: manifest({ forceUpdate: true }) }).status, 'required');
});

test('rejects malformed manifests and unsafe APK URLs', () => {
  assert.equal(validateAndroidReleaseManifest({}), null);
  assert.equal(isSafeAndroidApkUrl('javascript:alert(1)'), false);
  assert.equal(isSafeAndroidApkUrl('https://example.com/app.apk'), false);
  assert.equal(validateAndroidReleaseManifest(manifest({ apkUrl: 'data:application/octet-stream,apk' })), null);
  assert.equal(validateAndroidReleaseManifest(manifest({ minSupportedVersionCode: 5 })), null);
});

test('does not downgrade when latest build is lower than installed build', () => {
  assert.equal(decideAndroidUpdate({ installedVersionCode: 5, manifest: manifest() }).status, 'none');
});
