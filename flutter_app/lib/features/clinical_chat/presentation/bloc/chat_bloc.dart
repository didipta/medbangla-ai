import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/chat_message_entity.dart';
import '../../domain/usecases/send_chat_message_usecase.dart';
import 'chat_event.dart';
import 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final SendChatMessageUseCase sendUseCase;

  ChatBloc({required this.sendUseCase})
    : super(
        ChatLoadedState(
          messages: [
            ChatMessageEntity(
              id: 'init-msg',
              text:
                  'আসসালামু আলাইকুম! আমি মেডবাংলা এআই ক্লিনিক্যাল অ্যাসিস্ট্যান্ট। আপনার প্রেসক্রিপশন বা যেকোনো ওষুধ সম্পর্কে বাংলায় প্রশ্ন করতে পারেন।',
              isUser: false,
              timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
            ),
          ],
        ),
      ) {
    on<SendMessageEvent>(_onSendMessage);
    on<ResetChatEvent>(_onResetChat);
  }

  Future<void> _onSendMessage(
    SendMessageEvent event,
    Emitter<ChatState> emit,
  ) async {
    if (state is ChatLoadedState) {
      final current = state as ChatLoadedState;
      final userMsg = ChatMessageEntity(
        id: 'user-${DateTime.now().millisecondsSinceEpoch}',
        text: event.text,
        isUser: true,
        timestamp: DateTime.now(),
      );

      final updatedMessages = List<ChatMessageEntity>.from(current.messages)
        ..add(userMsg);
      emit(current.copyWith(messages: updatedMessages, isSending: true));

      try {
        final botMsg = await sendUseCase(
          event.text,
          medicines: event.relatedMedicines,
        );
        final finalMessages = List<ChatMessageEntity>.from(updatedMessages)
          ..add(botMsg);
        emit(current.copyWith(messages: finalMessages, isSending: false));
      } catch (e) {
        emit(current.copyWith(isSending: false));
      }
    }
  }

  void _onResetChat(ResetChatEvent event, Emitter<ChatState> emit) {
    emit(
      ChatLoadedState(
        messages: [
          ChatMessageEntity(
            id: 'reset-msg',
            text:
                'আসসালামু আলাইকুম! নতুন কথোপকথন শুরু হয়েছে। কীভাবে সাহায্য করতে পারি?',
            isUser: false,
            timestamp: DateTime.now(),
          ),
        ],
      ),
    );
  }
}
