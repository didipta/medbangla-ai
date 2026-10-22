import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../../domain/entities/interaction_entity.dart';
import '../../../../services/interaction_service.dart';

abstract class InteractionRemoteDataSource {
  Future<List<InteractionEntity>> checkInteractions(List<String> medicines);
}

class InteractionRemoteDataSourceImpl implements InteractionRemoteDataSource {
  final DioClient client;

  InteractionRemoteDataSourceImpl(this.client);

  @override
  Future<List<InteractionEntity>> checkInteractions(
    List<String> medicines,
  ) async {
    if (medicines.length < 2) return [];

    try {
      final res = await client.dio.post(
        ApiEndpoints.interactionsCheck,
        data: {'medicines': medicines},
      );

      if (res.statusCode == 200) {
        final list = res.data['interactions'] as List?;
        if (list != null && list.isNotEmpty) {
          return list.map((item) {
            final sevStr = (item['severity'] ?? 'warning')
                .toString()
                .toLowerCase();
            ClinicalSeverity sev = ClinicalSeverity.warning;
            if (sevStr.contains('critical') ||
                sevStr.contains('major') ||
                sevStr.contains('severe')) {
              sev = ClinicalSeverity.critical;
            } else if (sevStr.contains('safe') || sevStr.contains('minor')) {
              sev = ClinicalSeverity.safe;
            }

            return InteractionEntity(
              medicineA:
                  item['drug_a'] ?? item['drug_1'] ?? item['medicine_a'] ?? '',
              medicineB:
                  item['drug_b'] ?? item['drug_2'] ?? item['medicine_b'] ?? '',
              severity: sev,
              severityBn:
                  item['severity_bn'] ??
                  (sev == ClinicalSeverity.critical
                      ? 'মারাত্মক ঝুঁকি'
                      : 'সতর্কতা প্রয়োজন'),
              titleBn: item['title_bn'] ?? 'ঔষধীয় বিক্রিয়া ঝুঁকি',
              titleEn: item['title_en'] ?? 'Drug Interaction Risk',
              descriptionBn:
                  item['effect_bn'] ?? item['description_bn'] ?? item['explanation'] ?? '',
              descriptionEn: item['effect_en'] ?? item['description_en'] ?? '',
              clinicalRecommendationBn:
                  item['recommendation_bn'] ??
                  item['clinical_recommendation'] ??
                  'চিকিৎসকের সাথে পরামর্শ করুন।',
            );
          }).toList();
        }
      }
    } catch (_) {}

    // Fallback to local DGDA clinical rules
    final localResults = await InteractionService().checkInteractions(
      medicines,
    );
    return localResults.map((item) {
      ClinicalSeverity sev = ClinicalSeverity.warning;
      if (item.severity.name == 'critical') sev = ClinicalSeverity.critical;
      if (item.severity.name == 'safe') sev = ClinicalSeverity.safe;

      return InteractionEntity(
        medicineA: item.medicineA,
        medicineB: item.medicineB,
        severity: sev,
        severityBn: item.severityBn,
        titleBn: item.titleBn,
        titleEn: item.titleEn,
        descriptionBn: item.descriptionBn,
        descriptionEn: item.descriptionEn,
        clinicalRecommendationBn: item.clinicalRecommendationBn,
      );
    }).toList();
  }
}
