import 'dart:developer' as developer;
import 'package:google_sign_in/google_sign_in.dart';

class GoogleAuthResult {
  final bool success;
  final String? token;
  final String? email;
  final String? displayName;
  final String? photoUrl;
  final String? errorMessage;

  const GoogleAuthResult({
    required this.success,
    this.token,
    this.email,
    this.displayName,
    this.photoUrl,
    this.errorMessage,
  });
}

class GoogleAuthService {
  static const String googleClientId =
      '340889956556-3286me1r8lfmiojisv7g2tre4n8h7bgg.apps.googleusercontent.com';

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: googleClientId,
    scopes: ['email', 'profile', 'openid'],
  );

  Future<GoogleAuthResult> signIn() async {
    try {
      // Trigger native Google Sign-In sheet/dialog
      final GoogleSignInAccount? account = await _googleSignIn.signIn();

      if (account == null) {
        return const GoogleAuthResult(
          success: false,
          errorMessage: 'Google Sign-In was cancelled by user.',
        );
      }

      final GoogleSignInAuthentication auth = await account.authentication;
      final String? token = auth.idToken ?? auth.accessToken;

      developer.log(
        'Google Sign-In successful for: ${account.email}, hasIdToken: ${auth.idToken != null}',
      );

      return GoogleAuthResult(
        success: true,
        token: token ?? 'mobile-google::${account.email}::${account.displayName ?? ''}',
        email: account.email,
        displayName: account.displayName,
        photoUrl: account.photoUrl,
      );
    } catch (e, stackTrace) {
      developer.log(
        'Google Sign-In Platform Error: $e',
        error: e,
        stackTrace: stackTrace,
      );
      return GoogleAuthResult(
        success: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
  }
}
