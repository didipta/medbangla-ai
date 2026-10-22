import 'package:equatable/equatable.dart';

class DetectedMedicineEntity extends Equatable {
  final String rawText;
  final String matchedBrand;
  final String matchedGeneric;
  final String strength;
  final String form;
  final String dosagePattern;
  final String timing;
  final String duration;
  final double confidence;

  const DetectedMedicineEntity({
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

  DetectedMedicineEntity copyWith({
    String? rawText,
    String? matchedBrand,
    String? matchedGeneric,
    String? strength,
    String? form,
    String? dosagePattern,
    String? timing,
    String? duration,
    double? confidence,
  }) {
    return DetectedMedicineEntity(
      rawText: rawText ?? this.rawText,
      matchedBrand: matchedBrand ?? this.matchedBrand,
      matchedGeneric: matchedGeneric ?? this.matchedGeneric,
      strength: strength ?? this.strength,
      form: form ?? this.form,
      dosagePattern: dosagePattern ?? this.dosagePattern,
      timing: timing ?? this.timing,
      duration: duration ?? this.duration,
      confidence: confidence ?? this.confidence,
    );
  }

  @override
  List<Object?> get props => [
    matchedBrand,
    matchedGeneric,
    strength,
    dosagePattern,
    timing,
    duration,
  ];
}

class PrescriptionScanEntity extends Equatable {
  final String id;
  final String doctorName;
  final String doctorTitle;
  final String patientName;
  final String patientAge;
  final String patientGender;
  final String date;
  final String diagnosis;
  final List<DetectedMedicineEntity> medicines;
  final double overallConfidence;
  final String? imagePath;

  const PrescriptionScanEntity({
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

  PrescriptionScanEntity copyWith({
    String? id,
    String? doctorName,
    String? doctorTitle,
    String? patientName,
    String? patientAge,
    String? patientGender,
    String? date,
    String? diagnosis,
    List<DetectedMedicineEntity>? medicines,
    double? overallConfidence,
    String? imagePath,
  }) {
    return PrescriptionScanEntity(
      id: id ?? this.id,
      doctorName: doctorName ?? this.doctorName,
      doctorTitle: doctorTitle ?? this.doctorTitle,
      patientName: patientName ?? this.patientName,
      patientAge: patientAge ?? this.patientAge,
      patientGender: patientGender ?? this.patientGender,
      date: date ?? this.date,
      diagnosis: diagnosis ?? this.diagnosis,
      medicines: medicines ?? this.medicines,
      overallConfidence: overallConfidence ?? this.overallConfidence,
      imagePath: imagePath ?? this.imagePath,
    );
  }

  @override
  List<Object?> get props => [
    id,
    doctorName,
    patientName,
    diagnosis,
    medicines,
  ];
}
