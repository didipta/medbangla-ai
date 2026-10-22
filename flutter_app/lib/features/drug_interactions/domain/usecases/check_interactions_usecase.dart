import '../entities/interaction_entity.dart';
import '../repositories/interaction_repository.dart';

class CheckInteractionsUseCase {
  final InteractionRepository repository;

  CheckInteractionsUseCase(this.repository);

  Future<List<InteractionEntity>> call(List<String> medicines) {
    return repository.checkInteractions(medicines);
  }
}
