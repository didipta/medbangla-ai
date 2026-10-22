import '../../domain/entities/interaction_entity.dart';
import '../../domain/repositories/interaction_repository.dart';
import '../datasources/interaction_remote_datasource.dart';

class InteractionRepositoryImpl implements InteractionRepository {
  final InteractionRemoteDataSource remoteDataSource;

  InteractionRepositoryImpl(this.remoteDataSource);

  @override
  Future<List<InteractionEntity>> checkInteractions(
    List<String> medicines,
  ) async {
    return await remoteDataSource.checkInteractions(medicines);
  }
}
