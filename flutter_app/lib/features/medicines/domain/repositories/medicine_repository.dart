import '../entities/medicine_entity.dart';

abstract class MedicineRepository {
  Future<List<MedicineEntity>> searchMedicines(String query, {int limit = 20});
}
