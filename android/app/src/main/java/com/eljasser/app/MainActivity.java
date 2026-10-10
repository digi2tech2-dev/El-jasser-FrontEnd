package com.eljasser.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int APP_PERMISSIONS_REQUEST_CODE = 4102;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Capacitor 8 builds the Bridge during super.onCreate(); add local
        // plugins to its builder before that happens.
        registerPlugin(NativeGoogleAuthPlugin.class);
        super.onCreate(savedInstanceState);
        refreshRemoteSiteAssets();
        requestRequiredPermissions();
    }

    /**
     * The APK loads a remote Vite site. Cached HTML can reference hashed CSS
     * files removed by a later deployment, leaving the app without styling.
     * Keep cookies and local storage, but reload the page with fresh assets.
     */
    private void refreshRemoteSiteAssets() {
        if (getBridge() == null) return;
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.clearCache(true);
        webView.reload();
    }

    /**
     * Requests only the permissions needed by the app's camera and media-upload
     * features. Push notification permission is intentionally
     * owned by the Capacitor Push Notifications lifecycle after sign-in.
     */
    private void requestRequiredPermissions() {
        List<String> missingPermissions = new ArrayList<>();

        addIfMissing(missingPermissions, Manifest.permission.CAMERA);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            addIfMissing(missingPermissions, Manifest.permission.READ_MEDIA_IMAGES);
            addIfMissing(missingPermissions, Manifest.permission.READ_MEDIA_VIDEO);
        } else {
            addIfMissing(missingPermissions, Manifest.permission.READ_EXTERNAL_STORAGE);
        }

        if (!missingPermissions.isEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                missingPermissions.toArray(new String[0]),
                APP_PERMISSIONS_REQUEST_CODE
            );
        }
    }

    private void addIfMissing(List<String> permissions, String permission) {
        if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(permission);
        }
    }
}
