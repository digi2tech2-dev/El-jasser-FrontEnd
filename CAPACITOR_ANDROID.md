# Android APK (Capacitor URL)

The Android shell loads `https://www.jasser-card.com` by default. You can set
`CAPACITOR_SERVER_URL` to a different **HTTPS** URL before syncing or building.
Capacitor keeps a local asset directory as a technical fallback, but the
configured remote URL is what the app opens.

PowerShell:

```powershell
npm.cmd run android:sync
npm.cmd run android:open
```

Build a debug APK:

```powershell
npm.cmd run android:apk
```

The output is normally `android/app/build/outputs/apk/debug/app-debug.apk`.

The build requires Android Studio (including an Android SDK) and JDK 21. Ensure
`JAVA_HOME` points to that JDK before running the APK command.

`npm.cmd` is used above because this machine's PowerShell execution policy blocks
the `npm.ps1` shim.

## Permissions

This wrapper requests only Android's normal `INTERNET` permission, which is
needed to load the HTTPS website. It deliberately does not request camera,
location, contacts, microphone, storage, or notification permissions.

If the site opens links to third-party domains (payment gateways, OAuth, or
WhatsApp), add only those exact hosts to `allowNavigation` in
`capacitor.config.ts`.
