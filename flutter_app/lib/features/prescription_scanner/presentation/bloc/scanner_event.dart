import 'package:equatable/equatable.dart';
import '../../domain/entities/prescription_scan_entity.dart';

abstract class ScannerEvent extends Equatable {
  const ScannerEvent();

  @override
  List<Object?> get props => [];
}

class ScanImageFileEvent extends ScannerEvent {
  final String filePath;

  const ScanImageFileEvent(this.filePath);

  @override
  List<Object?> get props => [filePath];
}

class LoadPresetEvent extends ScannerEvent {
  final int presetIndex;

  const LoadPresetEvent(this.presetIndex);

  @override
  List<Object?> get props => [presetIndex];
}

class UpdateMedicineEvent extends ScannerEvent {
  final int index;
  final DetectedMedicineEntity medicine;

  const UpdateMedicineEvent({required this.index, required this.medicine});

  @override
  List<Object?> get props => [index, medicine];
}

class DeleteMedicineEvent extends ScannerEvent {
  final int index;

  const DeleteMedicineEvent(this.index);

  @override
  List<Object?> get props => [index];
}

class AddMedicineEvent extends ScannerEvent {
  final DetectedMedicineEntity medicine;

  const AddMedicineEvent(this.medicine);

  @override
  List<Object?> get props => [medicine];
}

class ResetScannerEvent extends ScannerEvent {
  const ResetScannerEvent();
}
