import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';
import 'api_config.dart';

class AppLifecycleStatus {
  final bool isMaintenance;
  final String maintenanceTitle;
  final String maintenanceMessage;
  final String maintenanceEta;
  final String emergencyContact;

  final bool updateAvailable;
  final bool isForceUpdate;
  final String latestVersion;
  final int latestVersionCode;
  final String updateTitle;
  final String updateNotes;
  final String downloadUrl;
  final String googleDriveUrl;
  final String fileSize;

  const AppLifecycleStatus({
    this.isMaintenance = false,
    this.maintenanceTitle = 'মেডবাংলা এআই সিস্টেম রক্ষণাবেক্ষণ চলছে',
    this.maintenanceMessage =
        'আমাদের ক্লিনিক্যাল ড্রাগ ডাটাবেজ এবং এআই সার্ভারের উন্নয়ন কাজ চলছে। কিছুক্ষণের মধ্যে সেবা পুনরায় চালু হবে।',
    this.maintenanceEta = '৩০ মিনিট',
    this.emergencyContact = 'support@medbangla.ai',
    this.updateAvailable = false,
    this.isForceUpdate = false,
    this.latestVersion = '1.0.0',
    this.latestVersionCode = 1,
    this.updateTitle = 'মেডবাংলা এআই নতুন সংস্করণ উপলব্ধ',
    this.updateNotes = '',
    this.downloadUrl = '',
    this.googleDriveUrl = '',
    this.fileSize = '24.8 MB',
  });

  factory AppLifecycleStatus.fromJson(Map<String, dynamic> json) {
    final maintenance = json['maintenance'] as Map<String, dynamic>? ?? {};
    final update = json['update'] as Map<String, dynamic>? ?? {};

    final latestCode = (update['latest_version_code'] as num?)?.toInt() ??
        (json['latest_version_code'] as num?)?.toInt() ??
        1;
    final latestVer = (update['latest_version'] as String? ??
            json['latest_version'] as String? ??
            '1.0.0')
        .trim();

    final minSupportedCode =
        (update['min_supported_version_code'] as num?)?.toInt() ??
            (json['min_supported_version_code'] as num?)?.toInt() ??
            1;

    // Direct comparison safeguards against server mismatch
    final isNewerCode = latestCode > AppControlService.currentVersionCode;
    final isNewerVersion = latestVer.isNotEmpty &&
        latestVer.replaceAll(RegExp(r'^[vV]'), '') !=
            AppControlService.currentVersionName.replaceAll(RegExp(r'^[vV]'), '');

    final updateAvailable = update['update_available'] == true ||
        json['update_available'] == true ||
        isNewerCode ||
        isNewerVersion;

    final forceFlag = update['is_force_update'] == true ||
        json['is_force_update'] == true;

    final isForceUpdate = updateAvailable &&
        (forceFlag || AppControlService.currentVersionCode < minSupportedCode);

    return AppLifecycleStatus(
      isMaintenance: maintenance['is_active'] == true ||
          json['is_maintenance_mode'] == true,
      maintenanceTitle: maintenance['title'] as String? ??
          json['maintenance_title'] as String? ??
          'মেডবাংলা এআই সিস্টেম রক্ষণাবেক্ষণ চলছে',
      maintenanceMessage: maintenance['message'] as String? ??
          json['maintenance_message'] as String? ??
          'আমাদের ক্লিনিক্যাল ড্রাগ ডাটাবেজ এবং এআই সার্ভারের উন্নয়ন কাজ চলছে। কিছুক্ষণের মধ্যে সেবা পুনরায় চালু হবে।',
      maintenanceEta: maintenance['eta'] as String? ??
          json['maintenance_eta'] as String? ??
          '৩০ মিনিট',
      emergencyContact: maintenance['emergency_contact'] as String? ??
          json['emergency_contact'] as String? ??
          'support@medbangla.ai',
      updateAvailable: updateAvailable,
      isForceUpdate: isForceUpdate,
      latestVersion: latestVer,
      latestVersionCode: latestCode,
      updateTitle: update['title'] as String? ??
          json['update_title'] as String? ??
          'মেডবাংলা এআই নতুন সংস্করণ উপলব্ধ',
      updateNotes: update['notes'] as String? ??
          json['update_notes'] as String? ??
          '',
      downloadUrl: update['download_url'] as String? ??
          json['apk_direct_download_url'] as String? ??
          json['apk_google_drive_url'] as String? ??
          update['apk_direct_download_url'] as String? ??
          '',
      googleDriveUrl: update['google_drive_url'] as String? ??
          json['apk_google_drive_url'] as String? ??
          update['apk_google_drive_url'] as String? ??
          '',
      fileSize: update['file_size'] as String? ??
          json['apk_file_size'] as String? ??
          '24.8 MB',
    );
  }
}

class AppControlService {
  static String _versionName = '1.0.1';
  static int _versionCode = 1;
  static bool _initialized = false;

  /// Dynamic version name read from pubspec.yaml (default '1.0.1')
  static String get currentVersionName => _versionName;

  /// Dynamic version code / build number read from pubspec.yaml (default 1)
  static int get currentVersionCode => _versionCode;

  /// Dynamically loads version and build number from pubspec.yaml via PackageInfo
  static Future<void> initVersionInfo() async {
    if (_initialized) return;
    try {
      final info = await PackageInfo.fromPlatform();
      if (info.version.isNotEmpty) {
        _versionName = info.version;
      }
      final parsedCode = int.tryParse(info.buildNumber);
      if (parsedCode != null && parsedCode > 0) {
        _versionCode = parsedCode;
      }
      _initialized = true;
      debugPrint('AppControl: Loaded version from pubspec.yaml: v$_versionName+$_versionCode');
    } catch (e) {
      debugPrint('AppControl PackageInfo warning: $e');
    }
  }

  static Future<AppLifecycleStatus> checkStatus({
    int? versionCode,
    String? versionName,
  }) async {
    if (!_initialized) {
      await initVersionInfo();
    }

    final code = versionCode ?? _versionCode;
    final ver = versionName ?? _versionName;

    final queryParams = {
      'version_code': code.toString(),
      'version': ver,
      'platform': 'android',
    };

    // 1. Try primary configured API URL
    try {
      final uri = Uri.parse(ApiConfig.appControlUrl).replace(
        queryParameters: queryParams,
      );
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data =
            jsonDecode(utf8.decode(response.bodyBytes));
        return AppLifecycleStatus.fromJson(data);
      }
    } catch (e) {
      debugPrint('AppControlService primary URL notice: $e');
    }

    // 2. Physical Android device auto-detection: try LAN IP if on Android
    if (!kIsWeb && ApiConfig.baseUrl != ApiConfig.lanFallbackBaseUrl) {
      try {
        final lanUri = Uri.parse(
          '${ApiConfig.lanFallbackBaseUrl}/api/v1/system/app-control',
        ).replace(queryParameters: queryParams);

        final response =
            await http.get(lanUri).timeout(const Duration(seconds: 4));

        if (response.statusCode == 200) {
          ApiConfig.setBaseUrl(ApiConfig.lanFallbackBaseUrl);
          debugPrint('Switched to working LAN backend: ${ApiConfig.baseUrl}');
          final Map<String, dynamic> data =
              jsonDecode(utf8.decode(response.bodyBytes));
          return AppLifecycleStatus.fromJson(data);
        }
      } catch (e) {
        debugPrint('AppControlService LAN fallback notice: $e');
      }
    }

    // Default safe state if backend cannot be reached or is offline
    return const AppLifecycleStatus();
  }
}
