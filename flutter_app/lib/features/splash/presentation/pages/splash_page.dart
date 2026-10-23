import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../services/app_control_service.dart';
import '../../../../widgets/app_update_dialog.dart';
import '../../../../widgets/maintenance_screen.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  String _statusMessage = 'ক্লিনিক্যাল এআই ইঞ্জিন লোড হচ্ছে...';
  double _progressValue = 0.2;
  AppLifecycleStatus? _lifecycleStatus;
  bool _isMaintenanceMode = false;
  bool _isForceUpdateRequired = false;
  bool _isNetworkOffline = false;

  @override
  void initState() {
    super.initState();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _scaleAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutBack),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeIn),
    );

    _animController.forward();
    _startAppInitialization();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _startAppInitialization() async {
    setState(() {
      _isMaintenanceMode = false;
      _isForceUpdateRequired = false;
      _isNetworkOffline = false;
      _progressValue = 0.25;
      _statusMessage = 'ক্লিনিক্যাল ড্রাগ ডাটাবেজ প্রস্তুত হচ্ছে...';
    });

    await Future.delayed(const Duration(milliseconds: 400));
    if (!mounted) return;

    setState(() {
      _progressValue = 0.55;
      _statusMessage = 'সার্ভার ও সিস্টেম আপডেট অনুসন্ধান চলছে...';
    });

    // 1. Fetch Real-time App Control & APK Update status from backend
    AppLifecycleStatus status;
    try {
      status = await AppControlService.checkStatus();
      _lifecycleStatus = status;
    } catch (e) {
      debugPrint('App control fetch warning: $e');
      status = const AppLifecycleStatus();
      _lifecycleStatus = status;
    }

    if (!mounted) return;

    // 2. Evaluate Maintenance Mode
    if (status.isMaintenance) {
      setState(() {
        _isMaintenanceMode = true;
      });
      return;
    }

    // 3. Evaluate Mandatory Force Update
    if (status.updateAvailable && status.isForceUpdate) {
      setState(() {
        _isForceUpdateRequired = true;
        _progressValue = 1.0;
        _statusMessage = 'বাধ্যতামূলক সংস্করণ আপডেট v${status.latestVersion} আবশ্যক';
      });

      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          AppUpdateDialog.show(context, status: status);
        }
      });
      return;
    }

    // 4. Progress towards completion
    setState(() {
      _progressValue = 0.90;
      _statusMessage = 'নিরাপত্তা প্রটোকল যাচাই সম্পন্ন...';
    });

    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;

    setState(() {
      _progressValue = 1.0;
      _statusMessage = 'মেডবাংলা এআই-তে স্বাগতম!';
    });

    // 5. Navigate to Home
    await Future.delayed(const Duration(milliseconds: 400));
    if (!mounted) return;

    if (status.updateAvailable) {
      // Pass optional update status to home so user is prompted on dashboard
      context.go('/home', extra: status);
    } else {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    // 1. If maintenance mode is active, display the MaintenanceScreen directly
    if (_isMaintenanceMode && _lifecycleStatus != null) {
      return MaintenanceScreen(
        status: _lifecycleStatus!,
        onRetry: _startAppInitialization,
      );
    }

    // 2. Normal Splash Canvas or Force Update state
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Ambient background gradient glow
          Positioned(
            top: -100,
            right: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.tealAccent.withValues(alpha: 0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            left: -80,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.12),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Main Center Content
          SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Spacer(),

                    // Animated Logo & Glow Container
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: ScaleTransition(
                        scale: _scaleAnimation,
                        child: Container(
                          width: 120,
                          height: 120,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                            border: Border.all(
                              color: AppColors.primary.withValues(alpha: 0.18),
                              width: 3,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.16),
                                blurRadius: 32,
                                spreadRadius: 6,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: ClipOval(
                            child: Image.asset(
                              'assets/images/medbangla_logo.jpg',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Image.asset(
                                  'assets/images/medbangla_icon.jpg',
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(
                                    Icons.local_hospital_rounded,
                                    size: 54,
                                    color: AppColors.primary,
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // App Title
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'মেডবাংলা',
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.textPrimary,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'AI',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'স্মার্ট ও নিরাপদ প্রেসক্রিপশন সহকারী',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const Spacer(),

                    // Progress Loader & Status Pill
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0FDFA),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.tealAccent.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                SizedBox(
                                  width: 12,
                                  height: 12,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      AppColors.primary,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  _statusMessage,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primaryDark,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Linear Animated Progress Bar
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: SizedBox(
                              width: 180,
                              height: 4,
                              child: LinearProgressIndicator(
                                value: _progressValue,
                                backgroundColor: const Color(0xFFE2E8F0),
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  AppColors.primary,
                                ),
                              ),
                            ),
                          ),

                          if (_isForceUpdateRequired && _lifecycleStatus != null) ...[
                            const SizedBox(height: 18),
                            SizedBox(
                              width: 220,
                              height: 44,
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  AppUpdateDialog.show(
                                    context,
                                    status: _lifecycleStatus!,
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFD97706),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                icon: const Icon(Icons.download_rounded, size: 18),
                                label: const Text(
                                  'এখনই আপডেট করুন',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextButton.icon(
                              onPressed: _startAppInitialization,
                              icon: const Icon(Icons.refresh_rounded, size: 14),
                              label: const Text(
                                'আপডেট সম্পন্ন হলে চাপুন',
                                style: TextStyle(fontSize: 12),
                              ),
                              style: TextButton.styleFrom(
                                foregroundColor: AppColors.primary,
                              ),
                            ),
                          ],

                          if (_isNetworkOffline) ...[
                            const SizedBox(height: 14),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                OutlinedButton.icon(
                                  onPressed: () => context.go('/home'),
                                  icon: const Icon(Icons.offline_bolt_rounded, size: 14),
                                  label: const Text('অফলাইনে চলুন'),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton.icon(
                                  onPressed: _startAppInitialization,
                                  icon: const Icon(Icons.refresh_rounded, size: 14),
                                  label: const Text('পুনরায় চেষ্টা'),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 36),

                    // Footer App Version & Credential Note
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: Column(
                        children: [
                          Text(
                            'ডিজিডিএ ১৭,৫৮৯+ নিবন্ধিত ঔষধ ডাটাবেজ',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'v${AppControlService.currentVersionName} • MedBangla HealthTech',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textMuted.withValues(alpha: 0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
