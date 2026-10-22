import '../entities/chat_message_entity.dart';

abstract class ChatRepository {
  Future<ChatMessageEntity> sendMessage(
    String message, {
    List<String>? medicines,
  });
}
