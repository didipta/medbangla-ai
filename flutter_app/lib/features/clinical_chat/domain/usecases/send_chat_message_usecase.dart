import '../entities/chat_message_entity.dart';
import '../repositories/chat_repository.dart';

class SendChatMessageUseCase {
  final ChatRepository repository;

  SendChatMessageUseCase(this.repository);

  Future<ChatMessageEntity> call(String message, {List<String>? medicines}) {
    return repository.sendMessage(message, medicines: medicines);
  }
}
