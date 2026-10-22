import 'package:equatable/equatable.dart';

class MedicineEntity extends Equatable {
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

  const MedicineEntity({
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

  @override
  List<Object?> get props => [
    brandId,
    brandName,
    genericName,
    strength,
    form,
    manufacturer,
    price,
  ];
}
