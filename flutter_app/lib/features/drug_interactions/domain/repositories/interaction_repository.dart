import '../entities/interaction_entity.dart';

abstract class InteractionRepository {
  Future<List<InteractionEntity>> checkInteractions(List<String> medicines);
}
