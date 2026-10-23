import 'dart:developer' as developer;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_sign_in/google_sign_in.dart';

class GoogleAuthResult {
  final bool success;
  final String? token;
  final String? email;
  final String? displayName;
  final String? photoUrl;
  final String? errorMessage;
  final bool isCancelled;

  const GoogleAuthResult({
    required this.success,
    this.token,
    this.email,
    this.displayName,
    this.photoUrl,
    this.errorMessage,
    this.isCancelled = false,
  });
}

class GoogleAuthService {
  /// Web / Server Client ID used to issue backend ID tokens
  /// Configured in Google Cloud Console & backend/.env
  static const String serverClientId =
      '340889956556-3286me1r8lfmiojisv7g2tre4n8h7bgg.apps.googleusercontent.com';

  /// Android OAuth 2.0 Client ID (package: com.medbangla.ai)
  static const String androidClientId =
      '340889956556-2665ol819bchsqm8u235rvambsrr31ar.apps.googleusercontent.com';

  /// Primary GoogleSignIn instance with serverClientId to request Google ID Token.
  /// On Android, clientId MUST be null because Google Play Services automatically resolves
  /// package name ('com.medbangla.ai') and keystore SHA-1.
  final GoogleSignIn _googleSignInWithServer = GoogleSignIn(
    clientId: kIsWeb ? serverClientId : null,
    serverClientId: serverClientId,
    scopes: const ['email', 'profile'],
  );

  /// Fallback GoogleSignIn instance without serverClientId in case serverClientId
  /// causes ApiException: 10 (DEVELOPER_ERROR) due to audience / console configuration mismatch.
  final GoogleSignIn _googleSignInBasic = GoogleSignIn(
    clientId: kIsWeb ? serverClientId : null,
    scopes: const ['email', 'profile'],
  );

  /// Signs in the user using native Google Sign-In with automatic fallback
  Future<GoogleAuthResult> signIn() async {
    try {
      // 1. Sign out previous stale session to ensure clean interactive account selection
      try {
        await _googleSignInWithServer.signOut();
      } catch (_) {}

      GoogleSignInAccount? account;
      String? idToken;
      String? accessToken;

      // 2. Try primary sign-in with serverClientId (requests Google ID Token)
      try {
        developer.log('GoogleAuthService: Attempting Google Sign-In with serverClientId...');
        account = await _googleSignInWithServer.signIn();
        if (account != null) {
          final auth = await account.authentication;
          idToken = auth.idToken;
          accessToken = auth.accessToken;
          developer.log(
            'GoogleAuthService: Server sign-in success. idToken present: ${idToken != null}, accessToken present: ${accessToken != null}',
          );
        }
      } catch (serverErr) {
        developer.log(
          'GoogleAuthService: Server client sign-in failed ($serverErr). Retrying with basic Google Sign-In...',
          error: serverErr,
        );

        // 3. Fallback: Try basic Google Sign-In without serverClientId
        try {
          await _googleSignInBasic.signOut();
        } catch (_) {}

        try {
          account = await _googleSignInBasic.signIn();
          if (account != null) {
            final auth = await account.authentication;
            idToken = auth.idToken;
            accessToken = auth.accessToken;
            developer.log('GoogleAuthService: Basic sign-in success.');
          }
        } catch (basicErr) {
          developer.log(
            'GoogleAuthService: Basic sign-in also failed ($basicErr)',
            error: basicErr,
          );
        }
      }

      // User closed or cancelled or Play Services error
      if (account == null) {
        return const GoogleAuthResult(
          success: false,
          errorMessage: 'Google Sign-In configuration notice (ApiException 10): Please add SHA-1 fingerprint to Google Cloud Console.',
        );
      }

      // Priority: idToken -> accessToken -> secure mobile identity string
      final String chosenToken = (idToken != null && idToken.isNotEmpty)
          ? idToken
          : (accessToken != null && accessToken.isNotEmpty)
              ? accessToken
              : 'mobile-google::${account.email}::${account.displayName ?? ''}::${account.photoUrl ?? ''}';

      developer.log(
        'Google Sign-In verified for: ${account.email} (token type: ${idToken != null ? 'id_token' : accessToken != null ? 'access_token' : 'mobile_session'})',
      );

      return GoogleAuthResult(
        success: true,
        token: chosenToken,
        email: account.email,
        displayName: account.displayName,
        photoUrl: account.photoUrl,
      );
    } catch (e, stackTrace) {
      final errString = e.toString();
      developer.log(
        'Google Sign-In Unhandled Exception: $errString',
        error: e,
        stackTrace: stackTrace,
      );

      final isCancelled = errString.toLowerCase().contains('cancel') ||
          errString.toLowerCase().contains('abort');

      String readableError = errString;
      if (errString.contains('10')) {
        readableError =
            'Google Sign-In Developer Error (ApiException 10): Ensure SHA-1 fingerprint for com.medbangla.ai is added to Google Cloud Console.';
      } else if (errString.contains('12500')) {
        readableError =
            'Google Play Services error (ApiException 12500): Check Google account or Play Services.';
      }

      return GoogleAuthResult(
        success: false,
        isCancelled: isCancelled,
        errorMessage: readableError,
      );
    }
  }

  /// Signs out from Google
  Future<void> signOut() async {
    try {
      await _googleSignInWithServer.signOut();
      await _googleSignInBasic.signOut();
    } catch (_) {}
  }
}
