import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../../../widgets/emergency_hotline_bar.dart';
import '../../../../widgets/study_disclaimer_sheet.dart';
import '../../../../widgets/user_avatar.dart';
import '../../../auth/domain/entities/user_entity.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../auth/presentation/widgets/auth_modal_sheet.dart';
import '../widgets/dashboard_stats_widget.dart';

class DashboardPage extends StatelessWidget {
  final Function(int) onNavigateTab;

  const DashboardPage({super.key, required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 12,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 34,
              width: 34,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.primarySurface),
                image: const DecorationImage(
                  image: AssetImage('assets/images/medbangla_icon.jpg'),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Flexible(
              child: RichText(
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
                text: const TextSpan(
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                  children: [
                    TextSpan(text: 'MedBangla '),
                    TextSpan(
                      text: 'AI',
                      style: TextStyle(color: AppColors.primary),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        actions: [
          // Language Switcher
          Padding(
            padding: const EdgeInsets.only(right: 6),
            child: OutlinedButton(
              onPressed: () => lang.toggleLanguage(),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                minimumSize: const Size(36, 30),
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
              child: Text(
                lang.isBangla ? 'EN' : 'বাং',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
          // User Auth Status Pill Button
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, authState) {
              if (authState is AuthLoadingState) {
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 7,
                        vertical: 3.5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.primarySurface),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                            width: 10,
                            height: 10,
                            child: CircularProgressIndicator(
                              strokeWidth: 1.8,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            lang.t('লোড হচ্ছে...', 'Loading...'),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }
              final isAuth =
                  authState is AuthenticatedState && !authState.user.isGuest;
              if (!isAuth) {
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ElevatedButton.icon(
                    onPressed: () => AuthModalSheet.show(context),
                    icon: const Icon(Icons.login_rounded, size: 14),
                    label: Text(lang.t('লগইন', 'Login')),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 0,
                      ),
                      minimumSize: const Size(60, 30),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                  ),
                );
              }
              final user = authState.user;
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: InkWell(
                  onTap: () => onNavigateTab(5),
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: user.isDoctor
                          ? const Color(0xFFEFF6FF)
                          : AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: user.isDoctor
                            ? const Color(0xFFBFDBFE)
                            : AppColors.primarySurface,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        UserAvatar(
                          imageUrl: user.picture,
                          name: user.name,
                          isDoctor: user.isDoctor,
                          radius: 10,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          user.isDoctor
                              ? lang.t('ডাঃ', 'Dr.')
                              : lang.t('রোগী', 'User'),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: user.isDoctor
                                ? const Color(0xFF1D4ED8)
                                : AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(
              Icons.info_outline_rounded,
              color: AppColors.textSecondary,
            ),
            onPressed: () => StudyDisclaimerSheet.show(context),
            tooltip: lang.t(
              'প্রকল্প পরিচিতি ও ক্লিনিক্যাল ডিসক্লেইমার',
              'Clinical Disclaimer',
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        children: [
          // Hero Banner
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryDark, AppColors.primary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.verified_rounded,
                              size: 14,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                lang.t(
                                  'ডিজিডিএ ও ক্লিনিক্যাল গ্রাউন্ডেড',
                                  'DGDA & BMDC Aligned',
                                ),
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.auto_awesome_rounded,
                      color: Colors.white70,
                      size: 20,
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  lang.t(
                    'প্রেসক্রিপশন বুঝুন বাংলায়,\nনিরাপদে থাকুন ওষুধ সেবনে',
                    'Understand Prescriptions,\nStay Safe with Medications',
                  ),
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  lang.t(
                    'হাতের লেখা প্রেসক্রিপশন ও ওষুধের পার্শ্বপ্রতিক্রিয়া যাচাইয়ের জন্য প্রথম বাংলাদেশি এআই প্ল্যাটফর্ম।',
                    'The first dedicated Bengali AI platform for handwriting prescription recognition & drug safety.',
                  ),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withValues(alpha: 0.9),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => onNavigateTab(1), // Scanner
                      icon: const Icon(
                        Icons.document_scanner_rounded,
                        size: 16,
                      ),
                      label: Text(lang.t('স্ক্যান করুন', 'Scan Rx')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primaryDark,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                      ),
                    ),
                    OutlinedButton.icon(
                      onPressed: () => onNavigateTab(2), // Medicines
                      icon: const Icon(Icons.search_rounded, size: 16),
                      label: Text(lang.t('ওষুধ খুঁজুন', 'Find Meds')),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white70),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Interactive Auth / Guest Banner (Matching Web Frontend Logic)
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, authState) {
              final user = authState is AuthenticatedState
                  ? authState.user
                  : UserEntity.guest;
              final isGuest = user.isGuest;

              if (isGuest) {
                return Container(
                  margin: const EdgeInsets.only(top: 14),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFBBF7D0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.auto_awesome_rounded,
                              color: Colors.amberAccent,
                              size: 16,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              lang.t(
                                '🌟 বাস্তব প্রেসক্রিপশন ডেমো ও গুগল সাইন-ইন',
                                '🌟 Real Rx Demo & Google Sign-In Guide',
                              ),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        lang.t(
                          'নিচে প্রস্তুতকৃত বাস্তব ডাক্তার প্রেসক্রিপশন দিয়ে বিনামূল্যে সম্পূর্ণ এআই ফিচার পরীক্ষা করুন। আপনার নিজস্ব প্রেসক্রিপশন স্ক্যান ও হিস্ট্রি সংরক্ষণের জন্য গুগল দিয়ে সাইন-ইন করুন।',
                          'Test full AI features freely with the verified doctor presets. To upload and scan your personal prescriptions, please sign in with your Google account.',
                        ),
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          ElevatedButton.icon(
                            onPressed: () {
                              context.read<AuthBloc>().add(
                                const LoginDemoEvent(role: 'patient'),
                              );
                            },
                            icon: const Icon(
                              Icons.flash_on_rounded,
                              size: 14,
                              color: Colors.amberAccent,
                            ),
                            label: Text(
                              lang.t('⚡ ১-ক্লিক ডেমো লগইন', '⚡ 1-Click Demo Login'),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF059669),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                          OutlinedButton.icon(
                            onPressed: () => AuthModalSheet.show(context),
                            icon: Image.network(
                              'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                              height: 14,
                              width: 14,
                              errorBuilder: (_, _, _) => const Icon(
                                Icons.g_mobiledata_rounded,
                                size: 16,
                                color: Colors.blue,
                              ),
                            ),
                            label: Text(
                              lang.t('গুগল দিয়ে প্রবেশ', 'Sign in with Google'),
                            ),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppColors.textPrimary,
                              side: const BorderSide(color: AppColors.border),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }

              // Authenticated Banner
              return Container(
                margin: const EdgeInsets.only(top: 14),
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: user.isDoctor
                      ? const Color(0xFFEFF6FF)
                      : AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: user.isDoctor
                        ? const Color(0xFFBFDBFE)
                        : AppColors.primary.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    UserAvatar(
                      imageUrl: user.picture,
                      name: user.name,
                      isDoctor: user.isDoctor,
                      radius: 18,
                      showBadge: true,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  lang.t(
                                    'স্বাগতম, ${user.name}!',
                                    'Welcome, ${user.name}!',
                                  ),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (user.isDoctor) ...[
                                const SizedBox(width: 4),
                                const Icon(
                                  Icons.verified_rounded,
                                  size: 13,
                                  color: Color(0xFF2563EB),
                                ),
                              ],
                            ],
                          ),
                          Text(
                            user.isDoctor
                                ? '${lang.t('চিকিৎসক সেশন সক্রিয়', 'Doctor Session Active')} (${user.bmdcNumber ?? 'BMDC Verified'})'
                                : lang.t(
                                    'রোগী ও পরিবার কেয়ার সেশন সক্রিয়',
                                    'Patient & Family Care Session Active',
                                  ),
                            style: TextStyle(
                              fontSize: 10,
                              color: user.isDoctor
                                  ? const Color(0xFF1D4ED8)
                                  : AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.lock_rounded,
                            size: 11,
                            color: Color(0xFF16A34A),
                          ),
                          const SizedBox(width: 3),
                          Text(
                            lang.t('নিরাপদ', 'Encrypted'),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF16A34A),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 16),

          // Clinical Accuracy & Database Stats
          const DashboardStatsWidget(),

          const SizedBox(height: 20),

          // Core Features Section
          Text(
            lang.t('মেডবাংলা এআই এর সেবাসমূহ', 'MedBangla AI Core Services'),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _buildServiceCard(
                  context,
                  icon: Icons.document_scanner_rounded,
                  title: lang.t('এআই প্রেসক্রিপশন স্ক্যানার', 'AI Rx Scanner'),
                  desc: lang.t(
                    'ডাক্তারের প্রেসক্রিপশন ছবি তুলে বাংলা বিশ্লেষণ',
                    'Bengali handwriting OCR & structured medicine info',
                  ),
                  color: AppColors.primary,
                  onTap: () => onNavigateTab(1),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildServiceCard(
                  context,
                  icon: Icons.medication_rounded,
                  title: lang.t('ওষুধ নির্দেশিকা ডিরেক্টরি', 'Meds Directory'),
                  desc: lang.t(
                    '১৭,৫৮৯+ নিবন্ধিত ব্র্যান্ড ও জেনেরিক তথ্য',
                    'Search 17,589+ DGDA approved BD brands & generics',
                  ),
                  color: const Color(0xFF0284C7),
                  onTap: () => onNavigateTab(2),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _buildServiceCard(
                  context,
                  icon: Icons.shield_rounded,
                  title: lang.t(
                    'ড্রাগ ইন্টারঅ্যাকশন সেফটি',
                    'Drug Interactions',
                  ),
                  desc: lang.t(
                    'একসাথে একাধিক ওষুধ সেবনে সম্ভাব্য ঝুঁকি',
                    'Clinical contraindication & safety cross-checks',
                  ),
                  color: const Color(0xFFD97706),
                  onTap: () => onNavigateTab(3),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildServiceCard(
                  context,
                  icon: Icons.chat_bubble_rounded,
                  title: lang.t('মেডবাংলা চ্যাট সহকারী', 'Clinical AI Chat'),
                  desc: lang.t(
                    'ওষুধের মাত্রা ও পার্শ্বপ্রতিক্রিয়া নিয়ে প্রশ্ন',
                    'Ask dosage, timing and medical questions in Bengali',
                  ),
                  color: const Color(0xFF059669),
                  onTap: () => onNavigateTab(4),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Emergency Hotlines
          const EmergencyHotlineBar(),
        ],
      ),
    );
  }

  Widget _buildServiceCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String desc,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        constraints: const BoxConstraints(minHeight: 145),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              desc,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
