import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/api_config.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final List<String>? relatedMedicines;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.relatedMedicines,
  });
}

class ChatProvider extends ChangeNotifier {
  final List<ChatMessage> _messages = [
    ChatMessage(
      text:
          'আসসালামু আলাইকুম! আমি মেডবাংলা এআই ক্লিনিক্যাল অ্যাসিস্ট্যান্ট। আপনার প্রেসক্রিপশন বা যেকোনো ওষুধ সম্পর্কে বাংলায় প্রশ্ন করতে পারেন।',
      isUser: false,
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
  ];

  bool _isTyping = false;

  List<ChatMessage> get messages => _messages;
  bool get isTyping => _isTyping;

  Future<void> sendMessage(
    String text, {
    String token = 'demo-patient-token',
    List<String>? medicines,
  }) async {
    final clean = text.trim();
    if (clean.isEmpty) return;

    _messages.add(
      ChatMessage(text: clean, isUser: true, timestamp: DateTime.now()),
    );
    _isTyping = true;
    notifyListeners();

    try {
      final res = await http
          .post(
            Uri.parse(ApiConfig.chatUrl),
            headers: ApiConfig.authHeaders(token),
            body: json.encode({
              'message': clean,
              'medicines': medicines ?? ['Paracetamol', 'Omeprazole'],
            }),
          )
          .timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        final answer = data['answer_bn'] ?? data['reply'];
        if (answer != null) {
          _messages.add(
            ChatMessage(text: answer, isUser: false, timestamp: DateTime.now()),
          );
          _isTyping = false;
          notifyListeners();
          return;
        }
      }
    } catch (_) {}

    // Smart Local Fallback Response based on query
    await Future.delayed(const Duration(milliseconds: 600));
    final lower = clean.toLowerCase();
    String fallbackReply;

    if (lower.contains('নাপা') ||
        lower.contains('napa') ||
        lower.contains('প্যারাসিটামল')) {
      fallbackReply =
          'নাপা (প্যারাসিটামল ৫০০ মি.গ্রা.) মূলত জ্বর ও বিভিন্ন ধরনের মৃদু থেকে মাঝারি ব্যথায় নির্দেশিত। প্রাপ্তবয়স্কদের ক্ষেত্রে প্রতি ৪-৬ ঘণ্টা পর পর ১টি বা ২টি ট্যাবলেট খাবারের পর সেবন করতে হবে। দিনে সর্বোচ্চ ৪০০০ মিলিগ্রামের বেশি গ্রহণ করা যাবে না। লিভারের সমস্যা থাকলে চিকিৎসকের পরামর্শ ছাড়া গ্রহণ করবেন না।';
    } else if (lower.contains('সেক্লো') ||
        lower.contains('seclo') ||
        lower.contains('গ্যাস্ট্রিক')) {
      fallbackReply =
          'সেক্লো (ওমেপ্রাজল ২০ মি.গ্রা.) একটি প্রোটন পাম্প ইনহিবিটর। এটি পাকস্থলীর অতিরিক্ত এসিড নিঃসরণ কমায় এবং বুকজ্বালা ও গ্যাস্ট্রিক আলসার নিরাময়ে কাজ করে। সকালে খাবার গ্রহণের কমপক্ষে ৩০ মিনিট আগে খালি পেটে ১টি ক্যাপসুল জল দিয়ে গিলে খেতে হয়। ক্যাপসুলটি চিবানো বা গুঁড়ো করা যাবে না।';
    } else if (lower.contains('এন্টাসিড') || lower.contains('সিপ্রো')) {
      fallbackReply =
          'সিপ্রোফ্লক্সাসিন এবং এন্টাসিড কখনোই একসাথে খাওয়া উচিত নয়! এন্টাসিডের অ্যালুমিনিয়াম সিপ্রোফ্লক্সাসিন রক্তে শোষণ হতে বাধা দেয়। সিপ্রোফ্লক্সাসিন সেবনের কমপক্ষে ২ ঘণ্টা আগে বা ৪ ঘণ্টা পর এন্টাসিড খাওয়া যেতে পারে।';
    } else {
      fallbackReply =
          'আপনার প্রশ্নের জন্য ধন্যবাদ। মেডবাংলা এআই ডিজিডিএ (DGDA) রেফারেন্স ডাটাবেজ অনুযায়ী পরামর্শ দেয়। যেকোনো ওষুধের ডোজ বা পরিবর্তন করার আগে সর্বদা আপনার রেজিস্টার্ড চিকিৎসকের সাথে পরামর্শ করুন।';
    }

    _messages.add(
      ChatMessage(
        text: fallbackReply,
        isUser: false,
        timestamp: DateTime.now(),
      ),
    );
    _isTyping = false;
    notifyListeners();
  }

  void clearChat() {
    _messages.clear();
    _messages.add(
      ChatMessage(
        text:
            'আসসালামু আলাইকুম! আমি মেডবাংলা এআই। কীভাবে আপনাকে সাহায্য করতে পারি?',
        isUser: false,
        timestamp: DateTime.now(),
      ),
    );
    notifyListeners();
  }
}
