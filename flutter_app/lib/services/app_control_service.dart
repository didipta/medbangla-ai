import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
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
    this.fileSize = '24.8 MB',
  });

  factory AppLifecycleStatus.fromJson(Map<String, dynamic> json) {
    final maintenance = json['maintenance'] as Map<String, dynamic>? ?? {};
    final update = json['update'] as Map<String, dynamic>? ?? {};

    return AppLifecycleStatus(
      isMaintenance: maintenance['is_active'] == true,
      maintenanceTitle: maintenance['title'] as String? ??
          'মেডবাংলা এআই সিস্টেম রক্ষণাবেক্ষণ চলছে',
      maintenanceMessage: maintenance['message'] as String? ??
          'আমাদের ক্লিনিক্যাল ড্রাগ ডাটাবেজ এবং এআই সার্ভারের উন্নয়ন কাজ চলছে। কিছুক্ষণের মধ্যে সেবা পুনরায় চালু হবে।',
      maintenanceEta: maintenance['eta'] as String? ?? '৩০ মিনিট',
      emergencyContact:
          maintenance['emergency_contact'] as String? ?? 'support@medbangla.ai',
      updateAvailable: update['update_available'] == true,
      isForceUpdate: update['is_force_update'] == true,
      latestVersion: update['latest_version'] as String? ?? '1.0.0',
      latestVersionCode: (update['latest_version_code'] as num?)?.toInt() ?? 1,
      updateTitle:
          update['title'] as String? ?? 'মেডবাংলা এআই নতুন সংস্করণ উপলব্ধ',
      updateNotes: update['notes'] as String? ?? '',
      downloadUrl: update['download_url'] as String? ?? '',
      fileSize: update['file_size'] as String? ?? '24.8 MB',
    );
  }
}

class AppControlService {
  static const int currentVersionCode = 1;
  static const String currentVersionName = '1.0.0';

  static Future<AppLifecycleStatus> checkStatus({
    int versionCode = currentVersionCode,
    String versionName = currentVersionName,
  }) async {
    try {
      final uri = Uri.parse(ApiConfig.appControlUrl).replace(queryParameters: {
        'version_code': versionCode.toString(),
        'version': versionName,
        'platform': 'android',
      });

      final response = await http.get(uri).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
        return AppLifecycleStatus.fromJson(data);
      }
    } catch (e) {
      debugPrint('AppControlService network warning: $e');
    }

    // Default safe state if backend cannot be reached or is offline
    return const AppLifecycleStatus();
  }
}
