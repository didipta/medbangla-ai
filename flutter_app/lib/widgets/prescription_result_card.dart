import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import '../models/prescription_model.dart';

class PrescriptionResultCard extends StatelessWidget {
  final PrescriptionScanResult result;
  final VoidCallback onCheckInteractions;

  const PrescriptionResultCard({
    super.key,
    required this.result,
    required this.onCheckInteractions,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Doctor & Prescription Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.primary,
                  radius: 22,
                  child: const Icon(
                    Icons.person_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        result.doctorName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        result.doctorTitle,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.primaryDark,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${lang.t("তারিখ:", "Date:")} ${result.date}',
                        style: const TextStyle(
                          fontSize: 10.5,
                          color: AppColors.textMuted,
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
                    color: AppColors.emeraldBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.check_circle_rounded,
                        size: 12,
                        color: AppColors.emerald,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${(result.overallConfidence * 100).toInt()}% ${lang.t("নির্ভুলতা", "Match")}',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppColors.emerald,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Patient Summary Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang.t('রোগী (Patient)', 'Patient Name'),
                        style: const TextStyle(
                          fontSize: 10.5,
                          color: AppColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        '${result.patientName} (${result.patientAge})',
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang.t('সম্ভাব্য সমস্যা / ডায়াগনোসিস', 'Diagnosis'),
                        style: const TextStyle(
                          fontSize: 10.5,
                          color: AppColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        result.diagnosis,
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryDark,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: AppColors.borderLight),

          // Detected Medicines List Header
          Padding(
            padding: const EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: 6,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${lang.t("সনাক্তকৃত ওষুধসমূহ", "Detected Medications")} (${result.medicines.length})',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  lang.t('ডোজ ও সময়সূচি', 'Dosage & Timing'),
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),

          // Medicines List
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            itemCount: result.medicines.length,
            separatorBuilder: (ctx, idx) => const SizedBox(height: 8),
            itemBuilder: (ctx, idx) {
              final med = result.medicines[idx];
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.medication_rounded,
                        size: 16,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                med.matchedBrand,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 5,
                                  vertical: 1,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Text(
                                  med.strength,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            med.matchedGeneric,
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: AppColors.primaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primarySurface,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            med.dosagePattern,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryDark,
                            ),
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          med.timing,
                          style: const TextStyle(
                            fontSize: 10.5,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 12),

          // Bottom Action Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onCheckInteractions,
                icon: const Icon(Icons.security_rounded, size: 18),
                label: Text(
                  lang.t(
                    'ড্রাগ-ড্রাগ ইন্টারঅ্যাকশন পরীক্ষা করুন',
                    'Verify Drug Safety Interactions',
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryDark,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
