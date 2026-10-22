import '../entities/medicine_entity.dart';
import '../repositories/medicine_repository.dart';

class SearchMedicinesUseCase {
  final MedicineRepository repository;

  SearchMedicinesUseCase(this.repository);

  Future<List<MedicineEntity>> call(String query, {int limit = 20}) {
    return repository.searchMedicines(query, limit: limit);
  }
}
