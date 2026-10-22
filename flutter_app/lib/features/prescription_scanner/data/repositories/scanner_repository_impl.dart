import '../../domain/entities/prescription_scan_entity.dart';
import '../../domain/repositories/scanner_repository.dart';
import '../datasources/scanner_remote_datasource.dart';

class ScannerRepositoryImpl implements ScannerRepository {
  final ScannerRemoteDataSource remoteDataSource;

  ScannerRepositoryImpl(this.remoteDataSource);

  @override
  Future<PrescriptionScanEntity> scanPrescriptionFile(String filePath) async {
    return await remoteDataSource.scanPrescription(filePath);
  }

  @override
  Future<PrescriptionScanEntity> getDemoPreset(int presetIndex) async {
    return remoteDataSource.getPreset(presetIndex);
  }
}
