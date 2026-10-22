import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';

class EmergencyHotlineBar extends StatelessWidget {
  const EmergencyHotlineBar({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F2), // Rose 50
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFFECDD3),
          width: 1.2,
        ), // Rose 200
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.alertCriticalBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.phone_in_talk_rounded,
                  color: AppColors.alertCritical,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang.t(
                        'জরুরি চিকিৎসা হটলাইন (বাংলাদেশ)',
                        'Emergency Medical Hotlines (BD)',
                      ),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF9F1239),
                      ),
                    ),
                    Text(
                      lang.t(
                        'তাৎক্ষণিক স্বাস্থ্য সংকটে সরকারি টেলিমেডিসিন হেল্পলাইন',
                        'Government telemedicine help for medical emergency',
                      ),
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF881337),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _buildHotlineChip(
                context,
                title: lang.t('জরুরি: ৯৯৯', 'Emergency: 999'),
                number: '999',
                color: Colors.white,
                textColor: AppColors.textPrimary,
                borderColor: AppColors.border,
              ),
              _buildHotlineChip(
                context,
                title: lang.t(
                  'স্বাস্থ্য বাতায়ন: ১৬২৬৩',
                  'Shastho Batayon: 16263',
                ),
                number: '16263',
                color: AppColors.primary,
                textColor: Colors.white,
                borderColor: AppColors.primary,
              ),
              _buildHotlineChip(
                context,
                title: lang.t('আইইডিসিআর: ১০৬৫৫', 'IEDCR: 10655'),
                number: '10655',
                color: AppColors.primaryDark,
                textColor: Colors.white,
                borderColor: AppColors.primaryDark,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHotlineChip(
    BuildContext context, {
    required String title,
    required String number,
    required Color color,
    required Color textColor,
    required Color borderColor,
  }) {
    return InkWell(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Hotline: $title (Dial: $number)'),
            duration: const Duration(seconds: 2),
            backgroundColor: AppColors.primaryDark,
          ),
        );
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: borderColor),
          boxShadow: const [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 2,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.call, size: 12, color: textColor),
            const SizedBox(width: 5),
            Text(
              title,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
