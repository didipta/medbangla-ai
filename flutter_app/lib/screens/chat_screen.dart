import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import '../providers/chat_provider.dart';
import '../services/auth_service.dart';
import '../widgets/formatted_chat_text.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();

  final List<String> _quickPrompts = [
    'প্যারাসিটামল খালি পেটে খাওয়া যায়?',
    'সিপ্রোফ্লক্সাসিন ও এন্টাসিড কেন একসাথে খাওয়া যাবে না?',
    'সেক্লো খাওয়ার সঠিক নিয়ম কি?',
    'উচ্চ রক্তচাপের ওষুধ কি হঠাৎ বন্ধ করা যায়?',
  ];

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send(String message) {
    if (message.trim().isEmpty) return;
    final auth = Provider.of<AuthService>(context, listen: false);
    final chat = Provider.of<ChatProvider>(context, listen: false);

    chat.sendMessage(message, token: auth.token);
    _textCtrl.clear();
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final chat = context.watch<ChatProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lang.t('মেডবাংলা এআই অ্যাসিস্ট্যান্ট', 'MedBangla Clinical AI'),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Row(
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    color: AppColors.emerald,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
                Text(
                  lang.t('ডিজিডিএ ডাটাবেজে সংযুক্ত', 'DGDA Monograph Grounded'),
                  style: const TextStyle(
                    fontSize: 10.5,
                    color: AppColors.primaryDark,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => chat.clearChat(),
            icon: const Icon(Icons.refresh_rounded),
            tooltip: lang.t('নতুন কথোপকথন', 'Clear Chat'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Quick Prompts Ribbon
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(vertical: 6),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: AppColors.borderLight)),
            ),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _quickPrompts.length,
              separatorBuilder: (ctx, idx) => const SizedBox(width: 8),
              itemBuilder: (ctx, idx) {
                final prompt = _quickPrompts[idx];
                return ActionChip(
                  label: Text(
                    prompt,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.primaryDark,
                    ),
                  ),
                  backgroundColor: AppColors.primaryLight,
                  side: const BorderSide(color: AppColors.primarySurface),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  onPressed: () => _send(prompt),
                );
              },
            ),
          ),

          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.all(16),
              itemCount: chat.messages.length,
              itemBuilder: (ctx, idx) {
                final msg = chat.messages[idx];
                return _buildMessageBubble(context, msg);
              },
            ),
          ),

          // Typing indicator
          if (chat.isTyping)
            Padding(
              padding: const EdgeInsets.only(left: 16, bottom: 8),
              child: Row(
                children: [
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    lang.t('এআই উত্তর তৈরি করছে...', 'AI is answering...'),
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),

          // Input Bar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textCtrl,
                      decoration: InputDecoration(
                        hintText: lang.t(
                          'ওষুধ সম্পর্কে যেকোনো প্রশ্ন লিখুন...',
                          'Ask a medicine question in Bangla/English...',
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      onSubmitted: _send,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () => _send(_textCtrl.text),
                    icon: const Icon(Icons.send_rounded),
                    color: AppColors.primary,
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.primaryLight,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(BuildContext context, ChatMessage msg) {
    return Align(
      alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.82,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: msg.isUser ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(msg.isUser ? 16 : 4),
            bottomRight: Radius.circular(msg.isUser ? 4 : 16),
          ),
          border: msg.isUser ? null : Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x06000000),
              blurRadius: 4,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: msg.isUser
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          children: [
            FormattedChatText(
              text: msg.text,
              isUser: msg.isUser,
              baseStyle: TextStyle(
                fontSize: 13.5,
                color: msg.isUser ? Colors.white : AppColors.textPrimary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${msg.timestamp.hour.toString().padLeft(2, '0')}:${msg.timestamp.minute.toString().padLeft(2, '0')}',
              style: TextStyle(
                fontSize: 9.5,
                color: msg.isUser ? Colors.white70 : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
