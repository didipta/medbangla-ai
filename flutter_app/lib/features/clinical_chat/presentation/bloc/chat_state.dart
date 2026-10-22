import 'package:equatable/equatable.dart';
import '../../domain/entities/chat_message_entity.dart';

abstract class ChatState extends Equatable {
  const ChatState();

  @override
  List<Object?> get props => [];
}

class ChatLoadedState extends ChatState {
  final List<ChatMessageEntity> messages;
  final bool isSending;

  const ChatLoadedState({required this.messages, this.isSending = false});

  @override
  List<Object?> get props => [messages, isSending];

  ChatLoadedState copyWith({
    List<ChatMessageEntity>? messages,
    bool? isSending,
  }) {
    return ChatLoadedState(
      messages: messages ?? this.messages,
      isSending: isSending ?? this.isSending,
    );
  }
}

class ChatErrorState extends ChatState {
  final String message;

  const ChatErrorState(this.message);

  @override
  List<Object?> get props => [message];
}
