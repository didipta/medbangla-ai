class ApiConfig {
  /// Official Production Render Cloud Backend
  static const String productionBaseUrl = 'https://medbangla-ai.onrender.com';

  /// Local development fallbacks
  static const String emulatorBaseUrl = 'http://10.0.2.2:8000';
  static const String lanFallbackBaseUrl = 'http://192.168.0.105:8000';
  static const String localBaseUrl = 'http://localhost:8000';

  static String? _customBaseUrl;

  static void setBaseUrl(String url) {
    _customBaseUrl = url.trim().replaceAll(RegExp(r'/+$'), '');
  }

  /// Base API URL for FastAPI Backend.
  /// Defaults to production Render cloud backend: https://medbangla-ai.onrender.com
  static String get baseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }
    return productionBaseUrl;
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
