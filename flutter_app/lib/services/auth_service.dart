import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class AuthService extends ChangeNotifier {
  static const String _userKey = 'medbangla_user_session';
  UserModel _currentUser = UserModel.guest();
  bool _isLoading = false;

  UserModel get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => !_currentUser.isGuest;
  String get token => _currentUser.token;

  AuthService() {
    _loadUserSession();
  }

  Future<void> _loadUserSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString(_userKey);
      if (userJson != null) {
        final data = json.decode(userJson);
        _currentUser = UserModel(
          id: data['id'],
          name: data['name'],
          email: data['email'],
          role: data['role'],
          picture: data['picture'],
          bmdcNumber: data['bmdc_number'],
          title: data['title'],
          token: data['token'] ?? 'demo-patient-token',
        );
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> loginAsPatient() async {
    _isLoading = true;
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 300));
    _currentUser = UserModel.demoPatient();
    await _saveUser();
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loginAsDoctor() async {
    _isLoading = true;
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 300));
    _currentUser = UserModel.demoDoctor();
    await _saveUser();
    _isLoading = false;
    notifyListeners();
  }

  Future<void> logout() async {
    _currentUser = UserModel.guest();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_userKey);
    } catch (_) {}
    notifyListeners();
  }

  Future<void> _saveUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final map = {
        'id': _currentUser.id,
        'name': _currentUser.name,
        'email': _currentUser.email,
        'role': _currentUser.role,
        'picture': _currentUser.picture,
        'bmdc_number': _currentUser.bmdcNumber,
        'title': _currentUser.title,
        'token': _currentUser.token,
      };
      await prefs.setString(_userKey, json.encode(map));
    } catch (_) {}
  }
}
