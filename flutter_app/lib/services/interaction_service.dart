import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/interaction_model.dart';
import 'api_config.dart';

class InteractionService {
  /// Check drug interactions using FastAPI backend or local DGDA matrix
  Future<List<DrugInteractionItem>> checkInteractions(
    List<String> medicines, {
    String token = 'demo-patient-token',
  }) async {
    if (medicines.length < 2) return [];

    try {
      final res = await http
          .post(
            Uri.parse(ApiConfig.interactionsCheckUrl),
            headers: ApiConfig.authHeaders(token),
            body: json.encode({'medicines': medicines}),
          )
          .timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        final list = data['interactions'] as List?;
        if (list != null && list.isNotEmpty) {
          return list
              .map((item) => DrugInteractionItem.fromJson(item))
              .toList();
        }
      }
    } catch (_) {}

    // Local Clinical DGDA Interaction Rules
    final results = <DrugInteractionItem>[];
    final medLower = medicines.map((m) => m.toLowerCase()).toList();

    for (final rule in _curatedInteractionRules) {
      final matchA = medLower.any(
        (m) => m.contains(rule.medicineA.toLowerCase()),
      );
      final matchB = medLower.any(
        (m) => m.contains(rule.medicineB.toLowerCase()),
      );

      if (matchA && matchB) {
        results.add(rule);
      }
    }

    return results;
  }

  static final List<DrugInteractionItem> _curatedInteractionRules = [
    DrugInteractionItem(
      medicineA: 'Ciprofloxacin',
      medicineB: 'Antacid',
      severity: InteractionSeverity.critical,
      severityBn: 'মারাত্মক ঝুঁকি (Critical)',
      titleBn: 'সিপ্রোফ্লক্সাসিন ও এন্টাসিডের মধ্যে শোষণ বাধা',
      titleEn: 'Chelation & Reduced Bioavailability',
      descriptionBn:
          'এন্টাসিডে থাকা অ্যালুমিনিয়াম ও ম্যাগনেসিয়াম সিপ্রোফ্লক্সাসিনের সাথে যুক্ত হয়ে অদ্রবণীয় যৌগ গঠন করে, ফলে ওষুধের রক্তে শোষণ ৯০% পর্যন্ত কমে যায় এবং ব্যাকটেরিয়ার সংক্রমণ নিরাময় ব্যর্থ হতে পারে।',
      descriptionEn:
          'Aluminium/Magnesium antacids chelate ciprofloxacin, reducing bioavailability by up to 90%.',
      clinicalRecommendationBn:
          'সিপ্রোফ্লক্সাসিন সেবনের কমপক্ষে ২ ঘণ্টা আগে অথবা ৪-৬ ঘণ্টা পরে এন্টাসিড গ্রহণ করুন। কখনোই একসাথে খাবেন না।',
    ),
    DrugInteractionItem(
      medicineA: 'Ciprofloxacin',
      medicineB: 'Calcium',
      severity: InteractionSeverity.warning,
      severityBn: 'মাঝারি সতর্কতা (Moderate)',
      titleBn: 'ক্যালসিয়াম ও ফ্লুরোকুইনোলোন ড্রাগ ইন্টারঅ্যাকশন',
      titleEn: 'Calcium Divalent Cation Binding',
      descriptionBn:
          'দুধ, দই বা ক্যালসিয়াম সাপ্লিমেন্ট সিপ্রোফ্লক্সাসিন শোষণে ব্যাঘাত ঘটায়।',
      descriptionEn:
          'Dietary calcium and supplements decrease fluoroquinolone absorption.',
      clinicalRecommendationBn:
          'দুধ বা ক্যালসিয়াম ওষুধ খাওয়ার অন্তত ২ ঘণ্টার ব্যবধানে সিপ্রোফ্লক্সাসিন সেবন করুন।',
    ),
    DrugInteractionItem(
      medicineA: 'Napa',
      medicineB: 'Ace',
      severity: InteractionSeverity.critical,
      severityBn: 'গুরুতর ঝুঁকি (Duplicate Therapy)',
      titleBn: 'একই জেনেরিকের ডুপ্লিকেট সেবন (প্যারাসিটামল বিষক্রিয়া)',
      titleEn: 'Duplicate Paracetamol Overdose Risk',
      descriptionBn:
          'নাপা এবং এইস উভয়ই প্যারাসিটামল। একসাথে দুটি ওষুধ খেলে প্যারাসিটামলের মাত্রা অতিরিক্ত হয়ে মারাত্মক লিভার নষ্ট হওয়ার (Hepatotoxicity) ঝুঁকি তৈরি হয়।',
      descriptionEn:
          'Both contain Paracetamol. Concurrent use risks severe acetaminophen-induced hepatotoxicity.',
      clinicalRecommendationBn:
          'যেকোনো একটি ব্র্যান্ড নির্বাচন করুন। দিনে সর্বোচ্চ ৪০০০ মিলিগ্রামের বেশি প্যারাসিটামল গ্রহণ করবেন না।',
    ),
    DrugInteractionItem(
      medicineA: 'Seclo',
      medicineB: 'Clopidogrel',
      severity: InteractionSeverity.critical,
      severityBn: 'মারাত্মক ঝুঁকি (Major Clinical Alert)',
      titleBn: 'ওমেপ্রাজল ও ক্লোপিডোগ্রেল রক্তজমাট বিরোধী ক্ষমতা হ্রাস',
      titleEn: 'CYP2C19 Inhibition Decreasing Antiplatelet Effect',
      descriptionBn:
          'ওমেপ্রাজল লিভারের CYP2C19 এনজাইম বাধাগ্রস্ত করে, যার ফলে হার্ট অ্যাটাকের ঝুঁকি প্রতিরোধক ক্লোপিডোগ্রেলের কার্যকারিতা কমে যেতে পারে।',
      descriptionEn:
          'Omeprazole inhibits CYP2C19 bioactivation of clopidogrel.',
      clinicalRecommendationBn:
          'ওমেপ্রাজলের পরিবর্তে ডাক্তারের পরামর্শে প্যান্টোপ্রাজল (Pantonix) বিবেচনা করুন।',
    ),
    DrugInteractionItem(
      medicineA: 'Aspirin',
      medicineB: 'Warfarin',
      severity: InteractionSeverity.critical,
      severityBn: 'মারাত্মক ঝুঁকি (Severe Bleeding)',
      titleBn: 'রক্তক্ষরণের মারাত্মক ঝুঁকি',
      titleEn: 'Additive Anticoagulant Bleeding Risk',
      descriptionBn:
          'উভয় ওষুধই রক্ত পাতলা করে, যার ফলে পাকস্থলী বা মস্তিষ্কে অনিয়ন্ত্রিত রক্তক্ষরণের ঝুঁকি বহুগুণ বেড়ে যায়।',
      descriptionEn:
          'Synergistic bleeding risk without strict INR therapeutic monitoring.',
      clinicalRecommendationBn:
          'চিকিৎসকের নিবিড় পর্যবেক্ষণ ও INR রক্ত পরীক্ষা ছাড়া কখনোই একসাথে খাবেন না।',
    ),
  ];
}
