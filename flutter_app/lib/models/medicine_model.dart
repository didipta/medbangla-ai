class MedicineModel {
  final int brandId;
  final String brandName;
  final String genericName;
  final String strength;
  final String form;
  final String manufacturer;
  final double price;
  final bool hasBilingualDoc;
  final String? indicationEn;
  final String? indicationBn;
  final String? sideEffectsEn;
  final String? sideEffectsBn;
  final String? dosageEn;
  final String? dosageBn;
  final String? precautionsBn;

  MedicineModel({
    required this.brandId,
    required this.brandName,
    required this.genericName,
    required this.strength,
    required this.form,
    required this.manufacturer,
    required this.price,
    this.hasBilingualDoc = false,
    this.indicationEn,
    this.indicationBn,
    this.sideEffectsEn,
    this.sideEffectsBn,
    this.dosageEn,
    this.dosageBn,
    this.precautionsBn,
  });

  factory MedicineModel.fromJson(Map<String, dynamic> json) {
    final bilingual = json['bilingual_profile'] as Map<String, dynamic>?;
    final sectionsBn = bilingual?['sections_bn'] as Map<String, dynamic>?;

    return MedicineModel(
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
