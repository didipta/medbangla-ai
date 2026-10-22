import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';

class StudyDisclaimerSheet extends StatelessWidget {
  const StudyDisclaimerSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const StudyDisclaimerSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.alertWarningBg,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.school_rounded,
                      color: AppColors.alertWarning,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.alertWarningBg,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFFDE68A)),
                          ),
                          child: Text(
                            lang.t(
                              'একাডেমিক ও শিক্ষামূলক গবেষণা প্রকল্প',
                              'Academic Research Project',
                            ),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF92400E),
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          lang.t(
                            'মেডবাংলা এআই — সতর্কতামূলক বিজ্ঞপ্তি',
                            'MedBangla AI — Clinical Notice',
                          ),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildNoticeItem(
                      icon: Icons.verified_user_rounded,
                      title: lang.t(
                        'সহায়ক ও ভেরিফিকেশন প্ল্যাটফর্ম মাত্র',
                        'Verification Assistant Only',
                      ),
                      desc: lang.t(
                        'মেডবাংলা এআই কোনো রোগ নির্ণয় করে না বা নিজে থেকে প্রেসক্রিপশন পরিবর্তন করে না। এটি শুধুমাত্র প্রেসক্রিপশন বুঝতে সাহায্য করে।',
                        'MedBangla AI assists in understanding prescriptions. It does not diagnose or alter treatment plans.',
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildNoticeItem(
                      icon: Icons.medical_services_rounded,
                      title: lang.t(
                        'ডিজিডিএ (DGDA) ও বিএমডিসি নীতি অনুসরণ',
                        'DGDA & BMDC Grounding',
                      ),
                      desc: lang.t(
                        'সকল ওষুধের তথ্য ও ড্রাগ ইন্টারেকশন নির্দেশিকা ডিজিডিএ যাচাইকৃত ক্লিনিক্যাল ডাটাবেজ দ্বারা নিয়ন্ত্রিত।',
                        'All drug information and clinical interaction guidelines strictly adhere to DGDA monographs.',
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildNoticeItem(
                      icon: Icons.warning_amber_rounded,
                      title: lang.t(
                        'ডাক্তারের মতামত চূড়ান্ত',
                        'Consult Licensed Physicians',
                      ),
                      desc: lang.t(
                        'ওষুধের ডোজ পরিবর্তন বা বন্ধ করার পূর্বে সর্বদা আপনার ডাক্তারের সাথে সরাসরি যোগাযোগ করুন।',
                        'Always consult your physician before starting, stopping, or altering medications.',
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    lang.t(
                      'আমি বুঝতে পেরেছি (I Understand)',
                      'I Understand & Agree',
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNoticeItem({
    required IconData icon,
    required String title,
    required String desc,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: const TextStyle(
                  fontSize: 11.5,
                  color: AppColors.textSecondary,
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
