import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import '../models/medicine_model.dart';

class MedicineDetailSheet extends StatelessWidget {
  final MedicineModel medicine;

  const MedicineDetailSheet({super.key, required this.medicine});

  static void show(BuildContext context, MedicineModel medicine) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => MedicineDetailSheet(medicine: medicine),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.primarySurface),
                  ),
                  child: const Icon(
                    Icons.medication_rounded,
                    color: AppColors.primary,
                    size: 28,
                  ),
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
                              medicine.brandName,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primarySurface,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              medicine.strength,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryDark,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${medicine.genericName} (${medicine.form})',
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.primaryDark,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        medicine.manufacturer,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: AppColors.border),

          // Content body
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Price & DGDA Strip
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceMuted,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.verified_rounded,
                            size: 16,
                            color: AppColors.emerald,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            lang.t(
                              'ডিজিডিএ ক্লিয়ারেন্স ভেরিফাইড',
                              'DGDA Clearance Verified',
                            ),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.emerald,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        '৳${medicine.price.toStringAsFixed(2)} / ${lang.t('ইউনিট', 'unit')}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Indications (নির্দেশনা)
                _buildSectionCard(
                  title: lang.t(
                    'রোগের লক্ষণ ও নির্দেশনা',
                    'Indications & Clinical Uses',
                  ),
                  icon: Icons.checklist_rounded,
                  color: AppColors.primary,
                  content: lang.isBangla
                      ? (medicine.indicationBn ??
                            medicine.indicationEn ??
                            'কোনো বিবরণ উপলব্ধ নেই।')
                      : (medicine.indicationEn ??
                            medicine.indicationBn ??
                            'No description available.'),
                ),

                const SizedBox(height: 12),

                // Dosage (মাত্রা ও সেবনবিধি)
                _buildSectionCard(
                  title: lang.t(
                    'সাধারণ সেবনবিধি ও মাত্রা',
                    'Dosage & Administration',
                  ),
                  icon: Icons.access_time_filled_rounded,
                  color: AppColors.secondary,
                  content: lang.isBangla
                      ? (medicine.dosageBn ??
                            medicine.dosageEn ??
                            'চিকিৎসকের পরামর্শ অনুযায়ী সেবন করুন।')
                      : (medicine.dosageEn ??
                            medicine.dosageBn ??
                            'As prescribed by physician.'),
                ),

                const SizedBox(height: 12),

                // Side Effects (পার্শ্বপ্রতিক্রিয়া)
                _buildSectionCard(
                  title: lang.t(
                    'সম্ভাব্য পার্শ্বপ্রতিক্রিয়া',
                    'Possible Side Effects',
                  ),
                  icon: Icons.warning_amber_rounded,
                  color: AppColors.alertWarning,
                  content: lang.isBangla
                      ? (medicine.sideEffectsBn ??
                            medicine.sideEffectsEn ??
                            'সাধারণত সুসহনীয়।')
                      : (medicine.sideEffectsEn ??
                            medicine.sideEffectsBn ??
                            'Generally well tolerated.'),
                ),

                const SizedBox(height: 12),

                // Precautions (সতর্কতা)
                _buildSectionCard(
                  title: lang.t(
                    'জরুরি সতর্কতা ও বিধি-নিষেধ',
                    'Special Precautions & Warnings',
                  ),
                  icon: Icons.health_and_safety_rounded,
                  color: AppColors.alertCritical,
                  content: lang.isBangla
                      ? (medicine.precautionsBn ??
                            'গর্ভকালীন বা বুকের দুধ পান করানোর সময় ডাক্তারের পরামর্শ ব্যতীত গ্রহণ করবেন না।')
                      : 'Consult doctor before use in pregnancy or renal/hepatic impairment.',
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Color color,
    required String content,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: color),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color == AppColors.alertCritical
                      ? AppColors.alertCritical
                      : AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}
