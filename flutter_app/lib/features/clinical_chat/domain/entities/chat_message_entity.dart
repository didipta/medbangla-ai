import 'package:equatable/equatable.dart';

class ChatMessageEntity extends Equatable {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final List<String>? relatedMedicines;

  const ChatMessageEntity({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.relatedMedicines,
  });

  @override
  List<Object?> get props => [id, text, isUser, timestamp];
}
