import '../../domain/entities/medicine_entity.dart';
import '../../domain/repositories/medicine_repository.dart';
import '../datasources/medicine_remote_datasource.dart';

class MedicineRepositoryImpl implements MedicineRepository {
  final MedicineRemoteDataSource remoteDataSource;

  MedicineRepositoryImpl(this.remoteDataSource);

  @override
  Future<List<MedicineEntity>> searchMedicines(
    String query, {
    int limit = 20,
  }) async {
    return await remoteDataSource.searchMedicines(query, limit: limit);
  }
}
