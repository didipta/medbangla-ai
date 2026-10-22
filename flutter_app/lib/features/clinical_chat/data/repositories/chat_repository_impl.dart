import '../../domain/entities/chat_message_entity.dart';
import '../../domain/repositories/chat_repository.dart';
import '../datasources/chat_remote_datasource.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDataSource remoteDataSource;

  ChatRepositoryImpl(this.remoteDataSource);

  @override
  Future<ChatMessageEntity> sendMessage(
    String message, {
    List<String>? medicines,
  }) async {
    return await remoteDataSource.sendMessage(message, medicines: medicines);
  }
}
