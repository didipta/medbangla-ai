import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';

class DashboardStatsWidget extends StatelessWidget {
  const DashboardStatsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Row(
      children: [
        _buildStatCard(
          context,
          icon: Icons.medication_rounded,
          value: '১৭,৫৮৯+',
          label: lang.t('নিবন্ধিত ওষুধ', 'BD Medicines'),
          accent: AppColors.primary,
        ),
        const SizedBox(width: 10),
        _buildStatCard(
          context,
          icon: Icons.shield_rounded,
          value: '৯৯.৪%',
          label: lang.t('ক্লিনিক্যাল নির্ভুলতা', 'Accuracy'),
          accent: AppColors.success,
        ),
        const SizedBox(width: 10),
        _buildStatCard(
          context,
          icon: Icons.translate_rounded,
          value: 'বাংলা',
          label: lang.t('ওষুধ নির্দেশনা', 'Bilingual'),
          accent: AppColors.primaryDark,
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required String value,
    required String label,
    required Color accent,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
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
          children: [
            Icon(icon, color: accent, size: 20),
            const SizedBox(height: 6),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: accent,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
