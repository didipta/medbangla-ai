import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppLanguage { bn, en }

class LanguageProvider extends ChangeNotifier {
  static const String _prefKey = 'medbangla_selected_lang';
  AppLanguage _language = AppLanguage.bn;

  LanguageProvider() {
    _loadPreference();
  }

  AppLanguage get language => _language;
  bool get isBangla => _language == AppLanguage.bn;
  String get code => _language == AppLanguage.bn ? 'bn' : 'en';

  Future<void> _loadPreference() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_prefKey);
      if (saved == 'en') {
        _language = AppLanguage.en;
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> setLanguage(AppLanguage lang) async {
    if (_language == lang) return;
    _language = lang;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKey, lang == AppLanguage.en ? 'en' : 'bn');
    } catch (_) {}
  }

  void toggleLanguage() {
    setLanguage(_language == AppLanguage.bn ? AppLanguage.en : AppLanguage.bn);
  }

  /// Bilingual translation helper matching web's `t(bn, en)`
  String t(String bn, String en) {
    return _language == AppLanguage.bn ? bn : en;
  }
}
