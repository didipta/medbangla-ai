import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService([FlutterSecureStorage? storage])
    : _storage =
          storage ?? const FlutterSecureStorage(aOptions: AndroidOptions());

  static const String _tokenKey = 'medbangla_jwt_token';

  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String> getToken() async {
    final token = await _storage.read(key: _tokenKey);
    return token ?? 'demo-patient-token';
  }

  Future<void> clearToken() async {
    await _storage.delete(key: _tokenKey);
  }
}
