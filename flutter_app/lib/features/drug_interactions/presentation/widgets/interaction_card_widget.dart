import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../domain/entities/interaction_entity.dart';

class InteractionCardWidget extends StatelessWidget {
  final InteractionEntity interaction;

  const InteractionCardWidget({super.key, required this.interaction});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    Color bg;
    Color border;
    Color accent;
    IconData icon;

    switch (interaction.severity) {
      case ClinicalSeverity.critical:
        bg = const Color(0xFFFEF2F2);
        border = const Color(0xFFFECACA);
        accent = AppColors.error;
        icon = Icons.cancel_rounded;
        break;
      case ClinicalSeverity.warning:
        bg = const Color(0xFFFFFBEB);
        border = const Color(0xFFFDE68A);
        accent = AppColors.warning;
        icon = Icons.warning_amber_rounded;
        break;
      case ClinicalSeverity.safe:
        bg = const Color(0xFFECFDF5);
        border = const Color(0xFFA7F3D0);
        accent = AppColors.success;
        icon = Icons.check_circle_rounded;
        break;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: accent, size: 22),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Text(
                            '${interaction.medicineA} + ${interaction.medicineB}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: accent.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            interaction.severityBn,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: accent,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      lang.t(interaction.titleBn, interaction.titleEn),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: accent,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            lang.t(interaction.descriptionBn, interaction.descriptionEn),
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.medical_services_outlined,
                  size: 16,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${lang.t('চিকিৎসকের পরামর্শ', 'Recommendation')}: ${interaction.clinicalRecommendationBn}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.primaryDark,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
