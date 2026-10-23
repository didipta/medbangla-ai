import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import '../services/app_control_service.dart';
import '../services/auth_service.dart';
import '../widgets/app_update_dialog.dart';
import '../widgets/study_disclaimer_sheet.dart';
import '../widgets/user_avatar.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final auth = context.watch<AuthService>();
    final user = auth.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.t('প্রোফাইল ও সেটিংস', 'Profile & Settings')),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // User Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                UserAvatar(
                  imageUrl: user.picture,
                  name: user.name,
                  isDoctor: user.isDoctor,
                  radius: 28,
                  showBadge: true,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        user.email,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: user.isDoctor
                              ? AppColors.primarySurface
                              : AppColors.surfaceMuted,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          user.isDoctor
                              ? '${user.bmdcNumber} • ${user.title}'
                              : (user.isGuest
                                    ? lang.t('অতিথি মোড', 'Guest Mode')
                                    : lang.t(
                                        'ভেরিফাইড রোগী',
                                        'Verified Patient',
                                      )),
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            color: user.isDoctor
                                ? AppColors.primaryDark
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Role Switcher / Demo Login Options
          Text(
            lang.t(
              'ডেমো প্রোফাইল নির্বাচন করুন (Sandbox)',
              'Select Demo Role (Sandbox Mode)',
            ),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),

          _buildActionTile(
            icon: Icons.person_outline_rounded,
            title: lang.t(
              'রোগী প্রোফাইল হিসেবে দেখুন',
              'Switch to Patient Profile',
            ),
            subtitle: 'Mahdi Hasan (Demo Patient)',
            isSelected: !user.isDoctor && !user.isGuest,
            onTap: () => auth.loginAsPatient(),
          ),
          const SizedBox(height: 8),

          _buildActionTile(
            icon: Icons.health_and_safety_outlined,
            title: lang.t(
              'চিকিৎসক প্রোফাইল হিসেবে দেখুন',
              'Switch to Doctor Profile (BMDC Verified)',
            ),
            subtitle: 'Prof. Dr. Md. Fazlul Hoque (BMDC-A-42190)',
            isSelected: user.isDoctor,
            onTap: () => auth.loginAsDoctor(),
          ),

          const SizedBox(height: 20),

          // Preferences & App Settings
          Text(
            lang.t('অ্যাপ সেটিংস', 'App Preferences'),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),

          Material(
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: AppColors.border),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(
                    Icons.language_rounded,
                    color: AppColors.primary,
                  ),
                  title: Text(
                    lang.t('ভাষা পরিবর্তন (Language)', 'Language (ভাষা)'),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.primarySurface),
                    ),
                    child: Text(
                      lang.isBangla ? 'বাংলা' : 'English',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ),
                  onTap: () => lang.toggleLanguage(),
                ),
                const Divider(
                  height: 1,
                  indent: 56,
                  color: AppColors.borderLight,
                ),
                ListTile(
                  leading: const Icon(
                    Icons.school_outlined,
                    color: AppColors.alertWarning,
                  ),
                  title: Text(
                    lang.t(
                      'গবেষণা ও শিক্ষামূলক নোটিশ',
                      'Academic Research Disclaimer',
                    ),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                  onTap: () => StudyDisclaimerSheet.show(context),
                ),
                const Divider(
                  height: 1,
                  indent: 56,
                  color: AppColors.borderLight,
                ),
                ListTile(
                  leading: const Icon(
                    Icons.system_update_rounded,
                    color: AppColors.primary,
                  ),
                  title: Text(
                    lang.t('অ্যাপের আপডেট পরীক্ষা করুন', 'Check for Updates'),
                  ),
                  subtitle: Text(
                    lang.t(
                      'বর্তমান সংস্করণ: v${AppControlService.currentVersionName}',
                      'Current Version: v${AppControlService.currentVersionName}',
                    ),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                  onTap: () async {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          lang.t(
                            'আপডেট অনুসন্ধান চলছে...',
                            'Checking for latest updates...',
                          ),
                        ),
                        duration: const Duration(seconds: 1),
                      ),
                    );

                    final status = await AppControlService.checkStatus();
                    if (!context.mounted) return;

                    if (status.updateAvailable) {
                      AppUpdateDialog.show(context, status: status);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.emerald,
                          content: Text(
                            lang.t(
                              'আপনি মেডবাংলা এআই এর সর্বশেষ সংস্করণ ব্যবহার করছেন।',
                              'You are running the latest version of MedBangla AI.',
                            ),
                          ),
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Logout / Reset
          if (auth.isAuthenticated)
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => auth.logout(),
                icon: const Icon(Icons.logout_rounded, size: 18),
                label: Text(
                  lang.t('লগআউট / রিসেট করুন', 'Reset to Guest Mode'),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.alertCritical,
                  side: const BorderSide(color: Color(0xFFFECDD3)),
                ),
              ),
            ),

          const SizedBox(height: 20),
          Center(
            child: Text(
              'MedBangla AI Mobile v2.0 • DGDA Clinical Engine',
              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryLight : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isSelected
                          ? AppColors.primaryDark
                          : AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle_rounded,
                color: AppColors.primary,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}
