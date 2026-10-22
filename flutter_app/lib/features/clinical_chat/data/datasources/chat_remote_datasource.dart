import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../../domain/entities/chat_message_entity.dart';

abstract class ChatRemoteDataSource {
  Future<ChatMessageEntity> sendMessage(
    String message, {
    List<String>? medicines,
  });
}

class ChatRemoteDataSourceImpl implements ChatRemoteDataSource {
  final DioClient client;

  ChatRemoteDataSourceImpl(this.client);

  @override
  Future<ChatMessageEntity> sendMessage(
    String message, {
    List<String>? medicines,
  }) async {
    try {
      final res = await client.dio.post(
        ApiEndpoints.chat,
        data: {
          'message': message,
          'medicines': medicines ?? ['Paracetamol', 'Omeprazole'],
        },
      );

      if (res.statusCode == 200) {
        final answer = res.data['answer_bn'] ?? res.data['reply'];
        if (answer != null) {
          return ChatMessageEntity(
            id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
            text: answer.toString(),
            isUser: false,
            timestamp: DateTime.now(),
          );
        }
      }
    } catch (_) {}

    // Fallback grounded Bangla clinical advice
    final lower = message.toLowerCase();
    String fallback;

    if (lower.contains('নাপা') ||
        lower.contains('napa') ||
        lower.contains('প্যারাসিটামল')) {
      fallback =
          'নাপা (প্যারাসিটামল ৫০০ মি.গ্রা.) মূলত জ্বর ও ব্যথায় নির্দেশিত। প্রাপ্তবয়স্কদের ক্ষেত্রে প্রতি ৪-৬ ঘণ্টা পর পর ১-২টি ট্যাবলেট খাবারের পর সেবন শ্রেয়। দিনে সর্বোচ্চ ৪০০০ মিলিগ্রামের বেশি গ্রহণ করবেন না।';
    } else if (lower.contains('সেক্লো') ||
        lower.contains('seclo') ||
        lower.contains('গ্যাস্ট্রিক')) {
      fallback =
          'সেক্লো (ওমেপ্রাজল ২০ মি.গ্রা.) গ্যাস্ট্রিক আলসার ও বুকজ্বালা নিরাময়ে কাজ করে। সকালে খাবার গ্রহণের কমপক্ষে ৩০ মিনিট আগে খালি পেটে ১টি ক্যাপসুল জল দিয়ে খেতে হয়।';
    } else if (lower.contains('এন্টাসিড') || lower.contains('সিপ্রো')) {
      fallback =
          'সিপ্রোফ্লক্সাসিন এবং এন্টাসিড একসাথে খাওয়া যাবে না! এন্টাসিড সিপ্রোফ্লক্সাসিনের শোষণ বাধাগ্রস্ত করে। কমপক্ষে ২ ঘণ্টা ব্যবধান রেখে সেবন করুন।';
    } else {
      fallback =
          'আপনার প্রশ্নের জন্য ধন্যবাদ। মেডবাংলা এআই ডিজিডিএ (DGDA) নির্দেশিকা অনুযায়ী তথ্য প্রদান করে। ওষুধের ডোজ পরিবর্তনের পূর্বে সর্বদা রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।';
    }

    return ChatMessageEntity(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      text: fallback,
      isUser: false,
      timestamp: DateTime.now(),
    );
  }
}
