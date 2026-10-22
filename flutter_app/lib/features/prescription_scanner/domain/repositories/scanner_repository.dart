import '../entities/prescription_scan_entity.dart';

abstract class ScannerRepository {
  Future<PrescriptionScanEntity> scanPrescriptionFile(String filePath);
  Future<PrescriptionScanEntity> getDemoPreset(int presetIndex);
}
