import 'package:flutter/material.dart';

/// MedBangla AI — Design System Palette
/// Matches the web frontend's curated clinical aesthetic (Deep Teal & Clean Slate)
class AppColors {
  // Brand Primary
  static const Color primary = Color(0xFF0F766E); // Deep Teal
  static const Color primaryDark = Color(0xFF115E59); // Forest Teal
  static const Color primaryLight = Color(0xFFF0FDFA); // Ice Teal background
  static const Color primarySurface = Color(0xFFCCFBF1); // Mint chip
  static const Color tealAccent = Color(0xFF14B8A6);

  // Secondary & Accents
  static const Color secondary = Color(0xFF0284C7); // Clinical Sky Blue
  static const Color emerald = Color(0xFF059669); // Safe verification
  static const Color emeraldBg = Color(0xFFECFDF5);

  // Triage & Safety Alert Colors
  static const Color alertCritical = Color(0xFFE11D48); // Rose / High risk
  static const Color alertCriticalBg = Color(0xFFFFE4E6);
  static const Color alertWarning = Color(
    0xFFD97706,
  ); // Amber / Moderate warning
  static const Color alertWarningBg = Color(0xFFFEF3C7);
  static const Color alertSafe = Color(0xFF059669); // Green / Normal
  static const Color alertSafeBg = Color(0xFFECFDF5);

  // Canvas & Surfaces
  static const Color canvas = Color(0xFFFAFDFB); // Warm Soft Canvas
  static const Color background = Color(0xFFFAFDFB);
  static const Color surface = Colors.white;
  static const Color surfaceMuted = Color(0xFFF8FAFC);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderLight = Color(0xFFF1F5F9);

  // Status Aliases (Compile-time constants)
  static const Color error = Color(0xFFE11D48);
  static const Color warning = Color(0xFFD97706);
  static const Color success = Color(0xFF059669);

  // Typography
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF475569); // Slate 600
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400
  static const Color textOnPrimary = Colors.white;

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF0F766E), Color(0xFF115E59)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF0F766E), Color(0xFF0D9488), Color(0xFF115E59)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient alertGradient = LinearGradient(
    colors: [Color(0xFFD97706), Color(0xFFF59E0B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
