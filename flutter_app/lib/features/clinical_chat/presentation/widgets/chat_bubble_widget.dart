import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/entities/chat_message_entity.dart';

class ChatBubbleWidget extends StatelessWidget {
  final ChatMessageEntity message;

  const ChatBubbleWidget({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;
    final timeStr = DateFormat('hh:mm a').format(message.timestamp);

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 14),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
          border: isUser ? null : Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x06000000),
              blurRadius: 4,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: isUser
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          children: [
            if (!isUser) ...[
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.primaryLight,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.smart_toy_rounded,
                      size: 12,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'MedBangla AI',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
            ],
            Text(
              message.text,
              style: TextStyle(
                fontSize: 13.5,
                color: isUser ? Colors.white : AppColors.textPrimary,
                height: 1.45,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              timeStr,
              style: TextStyle(
                fontSize: 9.5,
                color: isUser
                    ? Colors.white.withValues(alpha: 0.7)
                    : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
