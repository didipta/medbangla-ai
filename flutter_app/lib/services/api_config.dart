import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  /// Base API URL for FastAPI Backend
  /// Android Emulator uses 10.0.2.2 to reach host machine; Web & iOS use localhost
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8000';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000';
    }
    return 'http://localhost:8000';
  }

  static String get medicinesUrl => '$baseUrl/api/v1/medicines';
  static String get ocrAnalyzeUrl =>
      '$baseUrl/api/v1/ocr/analyze?db_lookup=true';
  static String get interactionsCheckUrl =>
      '$baseUrl/api/v1/interactions/check';
  static String get chatUrl => '$baseUrl/api/v1/chat';
  static String get healthUrl => '$baseUrl/api/v1/health';
  static String get appControlUrl => '$baseUrl/api/v1/system/app-control';

  static Map<String, String> authHeaders(String token) => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer $token',
  };
}
