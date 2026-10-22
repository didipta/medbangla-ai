import 'package:equatable/equatable.dart';
import '../../domain/entities/prescription_scan_entity.dart';

abstract class ScannerState extends Equatable {
  const ScannerState();

  @override
  List<Object?> get props => [];
}

class ScannerInitialState extends ScannerState {}

class ScannerLoadingState extends ScannerState {}

class ScannerLoadedState extends ScannerState {
  final PrescriptionScanEntity result;
  final String? customImagePath;

  const ScannerLoadedState({required this.result, this.customImagePath});

  @override
  List<Object?> get props => [result, customImagePath];
}

class ScannerErrorState extends ScannerState {
  final String message;

  const ScannerErrorState(this.message);

  @override
  List<Object?> get props => [message];
}
