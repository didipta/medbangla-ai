import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../bloc/chat_bloc.dart';
import '../bloc/chat_event.dart';
import '../bloc/chat_state.dart';
import '../widgets/chat_bubble_widget.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../auth/presentation/widgets/auth_modal_sheet.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final TextEditingController _textCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();

  final List<String> _quickPromptsBn = [
    'প্যারাসিটামল এর নিরাপদ দৈনিক ডোজ কত?',
    'খালি পেটে কি গ্যাস্ট্রিকের ওষুধ খাওয়া উচিত?',
    'সিপ্রোফ্লক্সাসিন খেলে কি দুধ বা অ্যান্টাসিড খাওয়া যাবে?',
  ];

  final List<String> _quickPromptsEn = [
    'What is safe daily dose of Paracetamol?',
    'Should antacids be taken on an empty stomach?',
    'Can Ciprofloxacin be taken with dairy?',
  ];

  @override
  void dispose() {
    _textCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendCurrentMessage() {
    final text = _textCtrl.text.trim();
    if (text.isNotEmpty) {
      context.read<ChatBloc>().add(SendMessageEvent(text));
      _textCtrl.clear();
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final quickPrompts = lang.isBangla ? _quickPromptsBn : _quickPromptsEn;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(
                color: AppColors.primaryLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.smart_toy_rounded,
                size: 18,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                lang.t(
                  'মেডবাংলা এআই অ্যাসিস্ট্যান্ট',
                  'MedBangla AI Assistant',
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: lang.t('নতুন চ্যাট', 'New Chat'),
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              context.read<ChatBloc>().add(ResetChatEvent());
            },
          ),
        ],
      ),
      body: BlocConsumer<ChatBloc, ChatState>(
        listener: (context, state) {
          _scrollToBottom();
        },
        builder: (context, state) {
          final messages = state is ChatLoadedState ? state.messages : [];
          final isSending = state is ChatLoadedState && state.isSending;

          return Column(
            children: [
              // Clinical Auth Banner
              BlocBuilder<AuthBloc, AuthState>(
                builder: (context, authState) {
                  final isGuest = authState is! AuthenticatedState ||
                      authState.user.isGuest;

                  if (isGuest) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      color: const Color(0xFFF0FDF4),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.info_outline_rounded,
                            size: 14,
                            color: Color(0xFF059669),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              lang.t(
                                'অতিথি মোড: সাধারণ প্রশ্ন করুন। হিস্ট্রি সংরক্ষণের জন্য সাইন-ইন করুন।',
                                'Guest Mode: Ask health questions. Sign in to save clinical chat.',
                              ),
                              style: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF065F46),
                              ),
                            ),
                          ),
                          TextButton(
                            onPressed: () => AuthModalSheet.show(context),
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.zero,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Text(
                              lang.t('লগইন', 'Login'),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  final user = authState.user;
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 6,
                    ),
                    color: user.isDoctor
                        ? const Color(0xFFEFF6FF)
                        : AppColors.primaryLight,
                    child: Row(
                      children: [
                        Icon(
                          user.isDoctor
                              ? Icons.medical_services_rounded
                              : Icons.verified_user_rounded,
                          size: 13,
                          color: user.isDoctor
                              ? const Color(0xFF2563EB)
                              : AppColors.primary,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            user.isDoctor
                                ? '${lang.t('চিকিৎসক ক্লিনিক্যাল মোড সক্রিয়', 'Doctor Clinical Mode Active')} • ${user.name}'
                                : '${lang.t('ব্যক্তিগত রোগী কেয়ার মোড', 'Patient Care Assistant Active')} • ${user.name}',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: user.isDoctor
                                  ? const Color(0xFF1D4ED8)
                                  : AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              // Chat message list
              Expanded(
                child: ListView.builder(
                  controller: _scrollCtrl,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    return ChatBubbleWidget(message: msg);
                  },
                ),
              ),

              // Sending indicator
              if (isSending)
                Padding(
                  padding: const EdgeInsets.only(left: 20, bottom: 8),
                  child: Row(
                    children: [
                      const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(AppColors.primary),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        lang.t(
                          'মেডবাংলা এআই লিখছে...',
                          'MedBangla AI is thinking...',
                        ),
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),

              // Quick prompts scroll
              Container(
                height: 40,
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  itemCount: quickPrompts.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    return ActionChip(
                      label: Text(quickPrompts[index]),
                      onPressed: () {
                        context.read<ChatBloc>().add(
                          SendMessageEvent(quickPrompts[index]),
                        );
                        _scrollToBottom();
                      },
                      backgroundColor: AppColors.primaryLight,
                      labelStyle: const TextStyle(
                        fontSize: 11,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                      side: BorderSide.none,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    );
                  },
                ),
              ),

              // Bottom Input Bar
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
                          onSubmitted: (_) => _sendCurrentMessage(),
                          decoration: InputDecoration(
                            hintText: lang.t(
                              'ওষুধ বা স্বাস্থ্য সম্পর্কিত প্রশ্ন লিখুন...',
                              'Ask a medicine question...',
                            ),
                            hintStyle: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textMuted,
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 10,
                            ),
                            filled: true,
                            fillColor: AppColors.background,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                              borderSide: const BorderSide(
                                color: AppColors.border,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                              borderSide: const BorderSide(
                                color: AppColors.border,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                              borderSide: const BorderSide(
                                color: AppColors.primary,
                                width: 1.5,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Material(
                        color: AppColors.primary,
                        shape: const CircleBorder(),
                        child: IconButton(
                          icon: const Icon(
                            Icons.send_rounded,
                            color: Colors.white,
                            size: 20,
                          ),
                          onPressed: _sendCurrentMessage,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
