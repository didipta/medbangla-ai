import '../../services/api_config.dart';
import '../../services/app_control_service.dart';

class AppConfig {
  static const String appName = 'MedBangla AI';
  static String get appVersion => AppControlService.currentVersionName;

  static String get apiBaseUrl => ApiConfig.baseUrl;

  static const Duration connectTimeout = Duration(seconds: 25);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
}
