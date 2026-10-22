import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../domain/entities/medicine_entity.dart';

class MedicineDetailModal extends StatelessWidget {
  final MedicineEntity medicine;

  const MedicineDetailModal({super.key, required this.medicine});

  static void show(BuildContext context, MedicineEntity medicine) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => MedicineDetailModal(medicine: medicine),
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
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                                color: AppColors.textPrimary,
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
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              medicine.strength,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        medicine.genericName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontStyle: FontStyle.italic,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${medicine.form} • ${medicine.manufacturer}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.close_rounded,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: AppColors.border),

          // Content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Price & Verification Card
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              lang.t('আনুমানিক বাজারদর', 'Est. Retail Price'),
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '৳${medicine.price.toStringAsFixed(2)} / unit',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.verified_rounded,
                              size: 16,
                              color: AppColors.success,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              lang.t('ডিজিডিএ অনুমোদিত', 'DGDA Approved'),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.success,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Indications
                _buildInfoSection(
                  icon: Icons.healing_rounded,
                  title: lang.t('নির্দেশনা (Indication)', 'Indications'),
                  contentBn: medicine.indicationBn,
                  contentEn: medicine.indicationEn,
                  isBn: lang.isBangla,
                ),

                const SizedBox(height: 16),

                // Dosage
                _buildInfoSection(
                  icon: Icons.schedule_rounded,
                  title: lang.t(
                    'সেবনবিধি ও মাত্রা (Dosage)',
                    'Dosage & Administration',
                  ),
                  contentBn: medicine.dosageBn,
                  contentEn: medicine.dosageEn,
                  isBn: lang.isBangla,
                ),

                const SizedBox(height: 16),

                // Side Effects
                _buildInfoSection(
                  icon: Icons.warning_amber_rounded,
                  title: lang.t(
                    'পার্শ্বপ্রতিক্রিয়া (Side Effects)',
                    'Side Effects',
                  ),
                  contentBn: medicine.sideEffectsBn,
                  contentEn: medicine.sideEffectsEn,
                  isBn: lang.isBangla,
                  color: AppColors.warning,
                ),

                const SizedBox(height: 16),

                // Safety precautions
                _buildInfoSection(
                  icon: Icons.health_and_safety_rounded,
                  title: lang.t('সতর্কতা ও বিধিবিধান', 'Precautions'),
                  contentBn: medicine.precautionsBn,
                  contentEn:
                      'Consult registered physician before taking during pregnancy or liver/kidney impairment.',
                  isBn: lang.isBangla,
                  color: AppColors.error,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection({
    required IconData icon,
    required String title,
    required String? contentBn,
    required String? contentEn,
    required bool isBn,
    Color color = AppColors.primary,
  }) {
    final text = isBn
        ? (contentBn ?? contentEn ?? 'তথ্য উপলব্ধ নয়')
        : (contentEn ?? contentBn ?? 'Information not available');

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: color),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
