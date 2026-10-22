import 'package:equatable/equatable.dart';

enum ClinicalSeverity { critical, warning, safe }

class InteractionEntity extends Equatable {
  final String medicineA;
  final String medicineB;
  final ClinicalSeverity severity;
  final String severityBn;
  final String titleBn;
  final String titleEn;
  final String descriptionBn;
  final String descriptionEn;
  final String clinicalRecommendationBn;

  const InteractionEntity({
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

  @override
  List<Object?> get props => [medicineA, medicineB, severity, titleBn];
}
