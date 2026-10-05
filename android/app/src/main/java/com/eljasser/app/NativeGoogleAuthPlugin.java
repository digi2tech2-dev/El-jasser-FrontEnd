package com.eljasser.app;

import android.content.Context;

import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.ClearCredentialException;
import androidx.credentials.exceptions.GetCredentialException;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

import java.util.concurrent.Executor;

@CapacitorPlugin(name = "NativeGoogleAuth")
public class NativeGoogleAuthPlugin extends Plugin {
    private CredentialManager credentialManager;
    private Executor executor;

    @Override
    public void load() {
        credentialManager = CredentialManager.create(getContext());
        executor = getActivity().getMainExecutor();
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        String serverClientId = getContext().getString(R.string.google_web_client_id).trim();
        if (serverClientId.isEmpty()) {
            call.reject("Native Google Sign-In is not configured. Set GOOGLE_WEB_CLIENT_ID for the Android build.", "GOOGLE_CONFIG_MISSING");
            return;
        }

        GetGoogleIdOption googleIdOption = new GetGoogleIdOption.Builder()
            .setServerClientId(serverClientId)
            .setFilterByAuthorizedAccounts(false)
            .setAutoSelectEnabled(false)
            .build();
        GetCredentialRequest request = new GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build();

        credentialManager.getCredentialAsync(
            getContext(), request, null, executor,
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse response) {
                    Credential credential = response.getCredential();
                    if (!(credential instanceof CustomCredential)
                        || !GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                        call.reject("Google did not return an ID token credential.", "GOOGLE_CREDENTIAL_INVALID");
                        return;
                    }
                    try {
                        GoogleIdTokenCredential googleCredential = GoogleIdTokenCredential.createFrom(credential.getData());
                        JSObject result = new JSObject();
                        result.put("idToken", googleCredential.getIdToken());
                        result.put("email", googleCredential.getId());
                        result.put("displayName", googleCredential.getDisplayName());
                        call.resolve(result);
                    } catch (Exception error) {
                        call.reject("Unable to parse the Google credential.", "GOOGLE_CREDENTIAL_PARSE_FAILED", error);
                    }
                }

                @Override
                public void onError(GetCredentialException error) {
                    call.reject("Google Sign-In was cancelled or unavailable.", "GOOGLE_SIGN_IN_FAILED", error);
                }
            }
        );
    }

    @PluginMethod
    public void signOut(PluginCall call) {
        credentialManager.clearCredentialStateAsync(
            new ClearCredentialStateRequest(), null, executor,
            new CredentialManagerCallback<Void, ClearCredentialException>() {
                @Override
                public void onResult(Void ignored) {
                    call.resolve();
                }

                @Override
                public void onError(ClearCredentialException error) {
                    call.reject("Unable to clear Google credential state.", "GOOGLE_SIGN_OUT_FAILED", error);
                }
            }
        );
    }
}
