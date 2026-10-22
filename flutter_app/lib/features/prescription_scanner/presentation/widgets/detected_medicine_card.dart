import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../domain/entities/prescription_scan_entity.dart';

class DetectedMedicineCard extends StatelessWidget {
  final DetectedMedicineEntity medicine;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const DetectedMedicineCard({
    super.key,
    required this.medicine,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.medication_rounded,
                  color: AppColors.primary,
                  size: 20,
                ),
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
                            medicine.matchedBrand,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            medicine.strength,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      medicine.matchedGeneric,
                      style: const TextStyle(
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                        color: AppColors.textSecondary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${(medicine.confidence * 100).toInt()}% ${lang.t('নির্ভুল', 'Match')}',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.success,
                  ),
                ),
              ),
              if (onEdit != null) ...[
                const SizedBox(width: 4),
                IconButton(
                  icon: const Icon(Icons.edit_outlined, size: 16),
                  color: AppColors.primary,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 26, minHeight: 26),
                  onPressed: onEdit,
                  tooltip: lang.t('ওষুধ এডিট করুন', 'Edit Medicine'),
                ),
              ],
              if (onDelete != null) ...[
                const SizedBox(width: 2),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, size: 16),
                  color: AppColors.alertCritical,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 26, minHeight: 26),
                  onPressed: onDelete,
                  tooltip: lang.t('ওষুধ মুছুন', 'Delete Medicine'),
                ),
              ],
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _buildBadge(Icons.calendar_today_rounded, medicine.dosagePattern),
              _buildBadge(Icons.restaurant_rounded, medicine.timing),
              _buildBadge(Icons.timer_outlined, medicine.duration),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.textMuted),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
