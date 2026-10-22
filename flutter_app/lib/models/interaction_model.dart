enum InteractionSeverity { critical, warning, safe }

class DrugInteractionItem {
  final String medicineA;
  final String medicineB;
  final InteractionSeverity severity;
  final String severityBn;
  final String titleBn;
  final String titleEn;
  final String descriptionBn;
  final String descriptionEn;
  final String clinicalRecommendationBn;

  DrugInteractionItem({
    required this.medicineA,
    required this.medicineB,
    required this.severity,
    required this.severityBn,
    required this.titleBn,
    required this.titleEn,
    required this.descriptionBn,
    required this.descriptionEn,
    required this.clinicalRecommendationBn,
  });

  factory DrugInteractionItem.fromJson(Map<String, dynamic> json) {
    final sevStr = (json['severity'] ?? 'warning').toString().toLowerCase();
    InteractionSeverity sev = InteractionSeverity.warning;
    if (sevStr.contains('critical') ||
        sevStr.contains('major') ||
        sevStr.contains('severe')) {
      sev = InteractionSeverity.critical;
    } else if (sevStr.contains('safe') || sevStr.contains('minor')) {
      sev = InteractionSeverity.safe;
    }

    return DrugInteractionItem(
      medicineA: json['drug_1'] ?? json['medicine_a'] ?? '',
      medicineB: json['drug_2'] ?? json['medicine_b'] ?? '',
      severity: sev,
      severityBn:
          json['severity_bn'] ??
          (sev == InteractionSeverity.critical
              ? 'মারাত্মক ঝুঁকি'
              : 'সতর্কতা প্রয়োজন'),
      titleBn: json['title_bn'] ?? 'ঔষধীয় বিক্রিয়া ঝুঁকি',
      titleEn: json['title_en'] ?? 'Drug Interaction Risk',
      descriptionBn: json['description_bn'] ?? json['explanation'] ?? '',
      descriptionEn: json['description_en'] ?? '',
      clinicalRecommendationBn:
          json['recommendation_bn'] ??
          json['clinical_recommendation'] ??
          'চিকিৎসকের সাথে পরামর্শ করুন।',
    );
  }
}
