import '../entities/prescription_scan_entity.dart';
import '../repositories/scanner_repository.dart';

class ScanPrescriptionUseCase {
  final ScannerRepository repository;

  ScanPrescriptionUseCase(this.repository);

  Future<PrescriptionScanEntity> call(String filePath) {
    return repository.scanPrescriptionFile(filePath);
  }

  Future<PrescriptionScanEntity> getPreset(int index) {
    return repository.getDemoPreset(index);
  }
}
