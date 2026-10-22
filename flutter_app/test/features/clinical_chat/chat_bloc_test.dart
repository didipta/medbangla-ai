import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_app/features/clinical_chat/domain/entities/chat_message_entity.dart';
import 'package:flutter_app/features/clinical_chat/domain/usecases/send_chat_message_usecase.dart';
import 'package:flutter_app/features/clinical_chat/presentation/bloc/chat_bloc.dart';
import 'package:flutter_app/features/clinical_chat/presentation/bloc/chat_event.dart';
import 'package:flutter_app/features/clinical_chat/presentation/bloc/chat_state.dart';

class MockSendChatMessageUseCase extends Mock
    implements SendChatMessageUseCase {}

void main() {
  late ChatBloc chatBloc;
  late MockSendChatMessageUseCase mockSendUseCase;

  final tBotResponse = ChatMessageEntity(
    id: 'bot-123',
    text: 'প্যারাসিটামল দৈনিক সর্বোচ্চ ৪০০০ মিগ্রা পর্যন্ত নিরাপদ।',
    isUser: false,
    timestamp: DateTime.now(),
  );

  setUp(() {
    mockSendUseCase = MockSendChatMessageUseCase();
    chatBloc = ChatBloc(sendUseCase: mockSendUseCase);
  });

  tearDown(() {
    chatBloc.close();
  });

  test('initial state should have a welcome greeting message', () {
    expect(chatBloc.state, isA<ChatLoadedState>());
    final loaded = chatBloc.state as ChatLoadedState;
    expect(loaded.messages.length, 1);
    expect(loaded.messages.first.isUser, isFalse);
  });

  blocTest<ChatBloc, ChatState>(
    'adds user message then appends bot response on SendMessageEvent',
    build: () {
      when(
        () => mockSendUseCase.call(any(), medicines: any(named: 'medicines')),
      ).thenAnswer((_) async => tBotResponse);
      return chatBloc;
    },
    act: (bloc) => bloc.add(const SendMessageEvent('প্যারাসিটামল ডোজ কত?')),
    verify: (_) {
      verify(
        () => mockSendUseCase.call(
          'প্যারাসিটামল ডোজ কত?',
          medicines: any(named: 'medicines'),
        ),
      ).called(1);
    },
  );
}
