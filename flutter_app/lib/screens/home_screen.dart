import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import '../services/auth_service.dart';
import '../widgets/emergency_hotline_bar.dart';
import '../widgets/study_disclaimer_sheet.dart';

class HomeScreen extends StatelessWidget {
  final Function(int) onNavigateTab;

  const HomeScreen({super.key, required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final auth = context.watch<AuthService>();

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
                text: TextSpan(
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                  children: [
                    const TextSpan(text: 'MedBangla '),
                    TextSpan(
                      text: 'AI',
                      style: const TextStyle(color: AppColors.primary),
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
            padding: const EdgeInsets.only(right: 8),
            child: OutlinedButton(
              onPressed: () => lang.toggleLanguage(),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                side: const BorderSide(color: AppColors.primarySurface),
                backgroundColor: AppColors.primaryLight,
              ),
              child: Text(
                lang.isBangla ? 'EN' : 'বাং',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryDark,
                ),
              ),
            ),
          ),
          // Info / Study Disclaimer
          IconButton(
            onPressed: () => StudyDisclaimerSheet.show(context),
            icon: const Icon(
              Icons.info_outline_rounded,
              color: AppColors.primary,
            ),
            tooltip: lang.t('সতর্কতামূলক বিজ্ঞপ্তি', 'Clinical Notice'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // Hero Banner
          _buildHeroBanner(context, lang, auth),
          const SizedBox(height: 16),

          // Emergency Hotlines Strip
          const EmergencyHotlineBar(),
          const SizedBox(height: 18),

          // Quick Action Feature Grid
          Text(
            lang.t('প্রধান সুবিধাসমূহ', 'Core Medical Modules'),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          _buildFeatureGrid(context, lang),
          const SizedBox(height: 18),

          // Platform Highlights & Stats
          _buildStatsRow(context, lang),
          const SizedBox(height: 16),

          // Academic Notice Banner
          _buildStudyDisclaimerCard(context, lang),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildHeroBanner(
    BuildContext context,
    LanguageProvider lang,
    AuthService auth,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.heroGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x220F766E),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0x2EFFFFFF),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.verified_rounded,
                      size: 14,
                      color: Colors.white,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      lang.t(
                        'ডিজিডিএ ক্লিনিক্যাল ডাটাবেজ',
                        'DGDA Grounded Framework',
                      ),
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              if (auth.isAuthenticated)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    auth.currentUser.isDoctor
                        ? 'Doctor (BMDC)'
                        : 'Verified Patient',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryDark,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            lang.t(
              'প্রেসক্রিপশন বুঝুন সহজে,\nওষুধের সঠিক ও নিরাপদ ব্যবহার জানুন',
              'Understand Prescriptions Clearly,\nVerify Drug Safety Instantly',
            ),
            style: const TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              height: 1.35,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            lang.t(
              'বাংলাদেশের প্রথম এআই প্রেসক্রিপশন ও ড্রাগ সেফটি ট্রায়াজ মোবাইল অ্যাসিস্ট্যান্ট।',
              'Bangladesh’s first AI prescription scanner & clinical drug interaction assistant.',
            ),
            style: const TextStyle(
              fontSize: 12.5,
              color: Color(0xE6FFFFFF),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => onNavigateTab(1), // Go to Scanner
            icon: const Icon(
              Icons.document_scanner_rounded,
              size: 18,
              color: AppColors.primary,
            ),
            label: Text(
              lang.t('প্রেসক্রিপশন স্ক্যান করুন', 'Scan Prescription Now'),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureGrid(BuildContext context, LanguageProvider lang) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.25,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _buildModuleCard(
          title: lang.t('প্রেসক্রিপশন চেকার', 'Prescription OCR'),
          subtitle: lang.t(
            'ক্যামেরা ও গ্যালারি স্ক্যান',
            'Scan & dosage parse',
          ),
          icon: Icons.camera_alt_rounded,
          color: AppColors.primary,
          bgColor: AppColors.primaryLight,
          onTap: () => onNavigateTab(1),
        ),
        _buildModuleCard(
          title: lang.t('ওষুধের তালিকা', 'Medicines Directory'),
          subtitle: lang.t('১৭,৫৮৯+ ব্র্যান্ড সার্চ', '17,589+ BD brands'),
          icon: Icons.search_rounded,
          color: AppColors.secondary,
          bgColor: const Color(0xFFF0F9FF),
          onTap: () => onNavigateTab(2),
        ),
        _buildModuleCard(
          title: lang.t('ড্রাগ সেফটি ট্রায়াজ', 'Drug Interaction'),
          subtitle: lang.t('ক্ষতিকর বিক্রিয়া যাচাই', 'Check safety matrix'),
          icon: Icons.shield_rounded,
          color: AppColors.alertWarning,
          bgColor: AppColors.alertWarningBg,
          onTap: () => onNavigateTab(3),
        ),
        _buildModuleCard(
          title: lang.t('বাংলা এআই চ্যাট', 'Bangla AI Assistant'),
          subtitle: lang.t('ক্লিনিক্যাল পরামর্শ', 'Ask medical queries'),
          icon: Icons.chat_bubble_rounded,
          color: const Color(0xFF8B5CF6),
          bgColor: const Color(0xFFF5F3FF),
          onTap: () => onNavigateTab(4),
        ),
      ],
    );
  }

  Widget _buildModuleCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required Color bgColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x06000000),
              blurRadius: 4,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 10.5,
                    color: AppColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsRow(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(
            '১৭,৫৮৯+',
            lang.t('ব্র্যান্ড ডাটাবেজ', 'Medicine Brands'),
          ),
          Container(width: 1, height: 32, color: AppColors.border),
          _buildStatItem(
            '৭৩৮+',
            lang.t('ডিজিডিএ মনোগ্রাফ', 'Clinical Monographs'),
          ),
          Container(width: 1, height: 32, color: AppColors.border),
          _buildStatItem('৯৯.৪%', lang.t('ওসিআর নির্ভুলতা', 'OCR Accuracy')),
        ],
      ),
    );
  }

  Widget _buildStatItem(String number, String label) {
    return Column(
      children: [
        Text(
          number,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
        ),
      ],
    );
  }

  Widget _buildStudyDisclaimerCard(
    BuildContext context,
    LanguageProvider lang,
  ) {
    return InkWell(
      onTap: () => StudyDisclaimerSheet.show(context),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFFFFBEB), // Amber 50
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFFDE68A)), // Amber 200
        ),
        child: Row(
          children: [
            const Icon(
              Icons.school_rounded,
              color: AppColors.alertWarning,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                lang.t(
                  'শিক্ষামূলক ও গবেষণা প্রজেক্ট — ডাক্তারের প্রেসক্রিপশন পরিবর্তন করবেন না।',
                  'Academic & research tool — always consult registered doctors.',
                ),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF92400E),
                ),
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: Color(0xFF92400E),
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}
