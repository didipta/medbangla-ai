import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import '../models/medicine_model.dart';
import 'medicine_detail_sheet.dart';

class MedicineCard extends StatelessWidget {
  final MedicineModel medicine;

  const MedicineCard({super.key, required this.medicine});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return InkWell(
      onTap: () => MedicineDetailSheet.show(context, medicine),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x08000000),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Form Icon Badge
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.primarySurface),
                  ),
                  child: Icon(
                    medicine.form.toLowerCase().contains('syrup')
                        ? Icons.medication_liquid_rounded
                        : (medicine.form.toLowerCase().contains('capsule')
                              ? Icons.vaccines_rounded
                              : Icons.medication_rounded),
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
                              medicine.brandName,
                              style: const TextStyle(
                                fontSize: 16,
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
                              vertical: 1.5,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceMuted,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Text(
                              medicine.strength,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${medicine.genericName} • ${medicine.form}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.primaryDark,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                // Price Tag
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '৳${medicine.price.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      lang.t('প্রতি পিস', 'per unit'),
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Divider(height: 1, color: AppColors.borderLight),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    medicine.manufacturer,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (medicine.hasBilingualDoc)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.emeraldBg,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.verified_rounded,
                          size: 11,
                          color: AppColors.emerald,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          lang.t('ডিজিডিএ মনোগ্রাফ', 'DGDA Monograph'),
                          style: const TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                            color: AppColors.emerald,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
