package com.eljasser.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int APP_PERMISSIONS_REQUEST_CODE = 4102;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestRequiredPermissions();
    }

    /**
     * Requests only the permissions needed by the app's camera, media-upload,
     * and notification features. Android shows its own localized explanations.
     */
    private void requestRequiredPermissions() {
        List<String> missingPermissions = new ArrayList<>();

        addIfMissing(missingPermissions, Manifest.permission.CAMERA);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            addIfMissing(missingPermissions, Manifest.permission.POST_NOTIFICATIONS);
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
