class ApiEndpoints {
  static const String health = '/api/v1/health';
  static const String medicines = '/api/v1/medicines';
  static const String ocrAnalyze = '/api/v1/ocr/analyze?db_lookup=true';
  static const String prescriptionsAnalyze = '/api/v1/prescriptions/analyze?db_lookup=true&use_vision_fallback=true';
  static const String prescriptionsHistory = '/api/v1/prescriptions/history';
  static const String prescriptionsDailyQuota = '/api/v1/prescriptions/daily-quota';
  static const String prescriptionsExplain = '/api/v1/prescriptions/explain';
  static const String interactionsCheck = '/api/v1/interactions/check';
  static const String chat = '/api/v1/chat';
  static const String authLogin = '/api/v1/auth/login';
  static const String authGoogle = '/api/v1/auth/google';
  static const String authMe = '/api/v1/auth/me';
  static const String authConfig = '/api/v1/auth/config';
  static const String authLimits = '/api/v1/auth/limits';
  static const String authProfile = '/api/v1/auth/profile';
}
