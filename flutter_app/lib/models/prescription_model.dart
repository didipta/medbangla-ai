class DetectedMedicineItem {
  final String rawText;
  final String matchedBrand;
  final String matchedGeneric;
  final String strength;
  final String form;
  final String dosagePattern; // e.g., 1+0+1
  final String timing; // e.g., খাবারের পর (after meal)
  final String duration; // e.g., ৫ দিন
  final double confidence;

  DetectedMedicineItem({
    required this.rawText,
    required this.matchedBrand,
    required this.matchedGeneric,
    required this.strength,
    required this.form,
    required this.dosagePattern,
    required this.timing,
    required this.duration,
    required this.confidence,
  });

  factory DetectedMedicineItem.fromJson(Map<String, dynamic> json) {
    return DetectedMedicineItem(
      rawText: json['raw_text'] ?? '',
      matchedBrand: json['matched_brand'] ?? json['brand_name'] ?? '',
      matchedGeneric: json['matched_generic'] ?? json['generic_name'] ?? '',
      strength: json['strength'] ?? '',
      form: json['form'] ?? 'Tablet',
      dosagePattern: json['dosage_pattern'] ?? json['dosage'] ?? '1+0+1',
      timing: json['timing'] ?? 'খাবারের পর',
      duration: json['duration'] ?? '৭ দিন',
      confidence: json['confidence'] != null
          ? (double.tryParse(json['confidence'].toString()) ?? 0.95)
          : 0.95,
    );
  }
}

class PrescriptionScanResult {
  final String id;
  final String doctorName;
  final String doctorTitle;
  final String patientName;
  final String patientAge;
  final String patientGender;
  final String date;
  final String diagnosis;
  final List<DetectedMedicineItem> medicines;
  final double overallConfidence;
  final String? imagePath;

  PrescriptionScanResult({
    required this.id,
    required this.doctorName,
    required this.doctorTitle,
    required this.patientName,
    required this.patientAge,
    required this.patientGender,
    required this.date,
    required this.diagnosis,
    required this.medicines,
    required this.overallConfidence,
    this.imagePath,
  });
}
