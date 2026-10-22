import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConfig {
  static const String appName = 'MedBangla AI';
  static const String appVersion = '2.0.0';

  static String get apiBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:8000';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000';
    }
    return 'http://localhost:8000';
  }

  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 15);
  static const Duration sendTimeout = Duration(seconds: 15);
}
