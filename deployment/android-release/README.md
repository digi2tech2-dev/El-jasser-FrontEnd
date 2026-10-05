# Android release distribution

This directory contains documentation and a manifest example only. Never put APK/AAB files, signing keys, Firebase configuration, or live production metadata in Git.

## Production layout

Keep releases outside `frontend/dist`, because a frontend deployment replaces that directory:

```text
/srv/DIGI-TECH/EL-JASSER/releases/android/
├── el-jasser-1.2.0.apk
├── el-jasser-1.3.0.apk
└── latest.json
```

The intended public endpoints are:

```text
https://jasser-card.com/downloads/android/latest.json
https://jasser-card.com/downloads/android/el-jasser-1.2.0.apk
```

## Manifest schema

Copy `latest.example.json` to the release directory and replace placeholder metadata after the APK is built.

- `platform` must be `android`.
- `appId` must be `com.eljasser.app`.
- `versionCode` is a positive Android build integer and is the update authority.
- `versionName` is display-only.
- `minSupportedVersionCode` is a non-negative integer. Installed builds below it require an update.
- `forceUpdate: true` requires an update for known older builds.
- `legacyForceUpdate: true` explicitly requires an update for APKs created before the Capacitor App plugin. Keep it `false` unless intentionally blocking those legacy installations.
- `apkUrl` must be an internal `/downloads/android/*.apk` path.
- `publishedAt`, `sizeBytes`, `sha256` (64 hex characters), and `releaseNotes` are optional but recommended.

The hosted frontend rejects malformed manifests and unsafe URLs, including external, `javascript:`, `data:`, `file:`, and `intent:` URLs. A bad or unavailable manifest never shows an update prompt.

## Nginx setup (manual production task)

Do not run this automatically. A server administrator can adapt this snippet in the appropriate `server` block:

```nginx
location = /downloads/android/latest.json {
    alias /srv/DIGI-TECH/EL-JASSER/releases/android/latest.json;
    default_type application/json;
    add_header Cache-Control "no-store, max-age=0" always;
}

location /downloads/android/ {
    alias /srv/DIGI-TECH/EL-JASSER/releases/android/;
    autoindex off;
    types { application/vnd.android.package-archive apk; }
    add_header X-Content-Type-Options nosniff always;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}
```

The exact `latest.json` location is handled separately so it does not receive the long-lived APK cache policy. Ensure Nginx workers can read the release directory and test configuration before reloading Nginx.

## Release procedure

1. Confirm `android/app/build.gradle` has a higher `versionCode` than every published release and update its display `versionName`.
2. Build and sign the APK using the approved Android signing process. Do not commit it.
3. Calculate the real checksum, for example: `sha256sum el-jasser-1.2.0.apk`.
4. Copy the APK and a completed `latest.json` into `/srv/DIGI-TECH/EL-JASSER/releases/android/` through the approved deployment process.
5. Verify the public manifest and APK URL over HTTPS. Confirm `latest.json` has `Cache-Control: no-store`.
6. Test update behavior on real devices before announcing the release.

## Required real-device checks

- An old APK loading the live site gets the optional update offer; **Later** closes it for that app session and an app reopen offers it again.
- The update action works from the old WebView, downloads/opens the APK, and Android shows its normal installer flow.
- A new 1.2.0 APK reports build `3`; manifest build `3` does not prompt; a valid later build does.
- A forced update cannot be dismissed, including with Android hardware Back (verify the device-specific back behavior; this UI has no React dismissal path).
- Browser and mobile-browser visits never show an Android update modal.
- New APK native Google and FCM work; old APK safely uses browser Google sign-in and skips native push.
