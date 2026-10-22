import '../../domain/entities/medicine_entity.dart';

class MedicineDto extends MedicineEntity {
  const MedicineDto({
    required super.brandId,
    required super.brandName,
    required super.genericName,
    required super.strength,
    required super.form,
    required super.manufacturer,
    required super.price,
    super.hasBilingualDoc,
    super.indicationEn,
    super.indicationBn,
    super.sideEffectsEn,
    super.sideEffectsBn,
    super.dosageEn,
    super.dosageBn,
    super.precautionsBn,
  });

  factory MedicineDto.fromJson(Map<String, dynamic> json) {
    final bilingual = json['bilingual_profile'] as Map<String, dynamic>?;
    final sectionsBn = bilingual?['sections_bn'] as Map<String, dynamic>?;

    return MedicineDto(
      brandId: json['brand_id'] is int
          ? json['brand_id']
          : int.tryParse(json['brand_id']?.toString() ?? '0') ?? 0,
      brandName: json['brand_name'] ?? '',
      genericName: json['generic_name'] ?? '',
      strength: json['strength'] ?? '',
      form: json['form'] ?? 'Tablet',
      manufacturer: json['manufacturer'] ?? 'Pharmaceuticals Ltd',
      price: json['price'] != null
          ? (double.tryParse(json['price'].toString()) ?? 0.0)
          : 0.0,
      hasBilingualDoc: json['has_bilingual_doc'] ?? (bilingual != null),
      indicationEn: json['indication'] ?? json['indication_en'],
      indicationBn: sectionsBn?['নির্দেশনা'] ?? sectionsBn?['indication'],
      sideEffectsEn: json['side_effects'] ?? json['side_effects_en'],
      sideEffectsBn:
          sectionsBn?['পার্শ্বপ্রতিক্রিয়া'] ?? sectionsBn?['side_effects'],
      dosageEn: json['dosage_en'],
      dosageBn: sectionsBn?['মাত্রা ও সেবনবিধি'] ?? sectionsBn?['dosage'],
      precautionsBn: sectionsBn?['সতর্কতা'] ?? sectionsBn?['precautions'],
    );
  }
}
