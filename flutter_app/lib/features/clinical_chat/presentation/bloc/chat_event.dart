import 'package:equatable/equatable.dart';

abstract class ChatEvent extends Equatable {
  const ChatEvent();

  @override
  List<Object?> get props => [];
}

class SendMessageEvent extends ChatEvent {
  final String text;
  final List<String>? relatedMedicines;

  const SendMessageEvent(this.text, {this.relatedMedicines});

  @override
  List<Object?> get props => [text, relatedMedicines];
}

class ResetChatEvent extends ChatEvent {}
