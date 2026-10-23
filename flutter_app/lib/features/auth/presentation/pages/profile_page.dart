import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../../../services/app_control_service.dart';
import '../../../../widgets/app_update_dialog.dart';
import '../../../../widgets/user_avatar.dart';
import '../../domain/entities/user_entity.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../widgets/auth_modal_sheet.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.t('প্রোফাইল ও সেটিংস', 'Profile & Settings')),
        actions: [
          IconButton(
            tooltip: lang.t('ভাষা পরিবর্তন করুন', 'Toggle Language'),
            icon: const Icon(Icons.translate_rounded),
            onPressed: () => lang.toggleLanguage(),
          ),
        ],
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthLoadingState) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 36,
                    height: 36,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    lang.t('প্রোফাইল লোড হচ্ছে...', 'Loading profile...'),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            );
          }

          final user = state is AuthenticatedState
              ? state.user
              : UserEntity.guest;
          final isGuest = user.isGuest;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // User Header Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x06000000),
                      blurRadius: 6,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    UserAvatar(
                      imageUrl: user.picture,
                      name: user.name,
                      isDoctor: user.isDoctor,
                      radius: 30,
                      showBadge: true,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  user.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 6),
                              if (user.isDoctor)
                                const Icon(
                                  Icons.verified_rounded,
                                  size: 16,
                                  color: Color(0xFF2563EB),
                                ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user.email,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: user.isDoctor
                                  ? const Color(0xFFEFF6FF)
                                  : AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              user.isDoctor
                                  ? '${lang.t('যাচাইকৃত ডাক্তার', 'Verified Doctor')} (${user.bmdcNumber ?? 'BMDC Registered'})'
                                  : (isGuest
                                        ? lang.t(
                                            'অতিথি মোড (Guest)',
                                            'Guest User',
                                          )
                                        : lang.t(
                                            'রোগী অ্যাকাউন্ট (Patient)',
                                            'Patient Account',
                                          )),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: user.isDoctor
                                    ? const Color(0xFF1D4ED8)
                                    : AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Login / Switch Account Callout
              if (isGuest)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primaryDark, AppColors.primary],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang.t(
                          'মেডবাংলা অ্যাকাউন্টে প্রবেশ করুন',
                          'Sign In to MedBangla AI',
                        ),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        lang.t(
                          'প্রেসক্রিপশন হিস্ট্রি সংরক্ষণ এবং আনলিমিটেড ড্রাগ সেফটি চেকের জন্য গুগল বা ডেমো অ্যাকাউন্ট দিয়ে লগইন করুন।',
                          'Sign in with Google or Demo account to save prescription history and unlock full clinical safety features.',
                        ),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white70,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: () => AuthModalSheet.show(context),
                        icon: const Icon(Icons.login_rounded, size: 16),
                        label: Text(
                          lang.t(
                            'লগইন বা ডেমো অ্যাক্সেস',
                            'Sign In / Demo Access',
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.primaryDark,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ],
                  ),
                )
              else
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => AuthModalSheet.show(context),
                        icon: const Icon(Icons.swap_horiz_rounded, size: 18),
                        label: Text(
                          lang.t('অ্যাকাউন্ট বদলান', 'Switch Account'),
                        ),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: const BorderSide(color: AppColors.primary),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () =>
                            context.read<AuthBloc>().add(LogoutEvent()),
                        icon: const Icon(
                          Icons.logout_rounded,
                          size: 18,
                          color: AppColors.error,
                        ),
                        label: Text(
                          lang.t('লগআউট', 'Log Out'),
                          style: const TextStyle(color: AppColors.error),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFFECACA)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

              const SizedBox(height: 20),

              // Clinical API Quota & Usage Stats
              Text(
                lang.t('দৈনিক ব্যবহার ও কোটা', 'Daily Quota & Usage'),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),

              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _buildQuotaRow(
                      icon: Icons.document_scanner_rounded,
                      title: lang.t(
                        'প্রেসক্রিপশন এআই স্ক্যান',
                        'Prescription OCR',
                      ),
                      used: isGuest
                          ? '৩ / ৫'
                          : (user.isDoctor ? 'আনলিমিটেড' : '১২ / ৫০'),
                    ),
                    const Divider(height: 16, color: AppColors.border),
                    _buildQuotaRow(
                      icon: Icons.shield_rounded,
                      title: lang.t(
                        'ড্রাগ ইন্টারঅ্যাকশন চেক',
                        'Drug Interaction Checks',
                      ),
                      used: isGuest
                          ? '১০ / ২০'
                          : (user.isDoctor ? 'আনলিমিটেড' : '১০০ / ১০০'),
                    ),
                    const Divider(height: 16, color: AppColors.border),
                    _buildQuotaRow(
                      icon: Icons.chat_bubble_rounded,
                      title: lang.t(
                        'এআই ক্লিনিক্যাল চ্যাট',
                        'Clinical AI Messages',
                      ),
                      used: isGuest
                          ? '৫ / ১০'
                          : (user.isDoctor ? 'আনলিমিটেড' : '৫০ / ৫০'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // App Settings & Preferences
              Text(
                lang.t('অ্যাপ সেটিংস', 'App Settings'),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),

              Material(
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
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
                        lang.t('অ্যাপের ভাষা (Language)', 'Language'),
                      ),
                      subtitle: Text(
                        lang.isBangla ? 'বাংলা (Bengali)' : 'English',
                      ),
                      trailing: TextButton(
                        onPressed: () => lang.toggleLanguage(),
                        child: Text(
                          lang.isBangla ? 'English এ যান' : 'বাংলায় যান',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    ListTile(
                      leading: const Icon(
                        Icons.health_and_safety_rounded,
                        color: AppColors.primary,
                      ),
                      title: Text(
                        lang.t(
                          'ক্লিনিক্যাল নির্দেশিকা ও পলিসি',
                          'Clinical Safety Policies',
                        ),
                      ),
                      subtitle: Text(
                        lang.t(
                          'ডিজিডিএ ও বিএমডিসি প্রটোকল',
                          'DGDA & BMDC Protocols',
                        ),
                      ),
                      trailing: const Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 14,
                        color: AppColors.textMuted,
                      ),
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              lang.t(
                                'মেডবাংলা এআই সকল ক্লিনিক্যাল তথ্য ডিজিডিএ ডাটাবেজ থেকে সংগ্রহ করে।',
                                'MedBangla AI references officially approved DGDA drug monographs.',
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                    const Divider(height: 1, color: AppColors.border),
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
                      trailing: const Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 14,
                        color: AppColors.textMuted,
                      ),
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
            ],
          );
        },
      ),
    );
  }

  Widget _buildQuotaRow({
    required IconData icon,
    required String title,
    required String used,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Row(
            children: [
              Icon(icon, size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Text(
          used,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: AppColors.primaryDark,
          ),
        ),
      ],
    );
  }
}
