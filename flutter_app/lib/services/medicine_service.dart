import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/medicine_model.dart';
import 'api_config.dart';

class MedicineService {
  /// Fetch medicines from FastAPI backend or fallback to local curated BD dataset
  Future<List<MedicineModel>> searchMedicines(
    String query, {
    String token = 'demo-patient-token',
    int limit = 20,
  }) async {
    final cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.isEmpty) {
      return curatedMedicines.take(15).toList();
    }

    try {
      final uri = Uri.parse(
        '${ApiConfig.medicinesUrl}?q=${Uri.encodeComponent(cleanQuery)}&limit=$limit',
      );
      final res = await http
          .get(uri, headers: ApiConfig.authHeaders(token))
          .timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        final list = data['results'] as List?;
        if (list != null && list.isNotEmpty) {
          return list.map((item) => MedicineModel.fromJson(item)).toList();
        }
      }
    } catch (_) {
      // Gracefully fall through to instant offline matching
    }

    // Local fuzzy/contains search over curated Bangladesh dataset
    return curatedMedicines.where((med) {
      return med.brandName.toLowerCase().contains(cleanQuery) ||
          med.genericName.toLowerCase().contains(cleanQuery) ||
          med.manufacturer.toLowerCase().contains(cleanQuery);
    }).toList();
  }

  /// Curated Bangladesh top medicine dataset matching DGDA clinical monographs
  static final List<MedicineModel> curatedMedicines = [
    MedicineModel(
      brandId: 101,
      brandName: 'Napa',
      genericName: 'Paracetamol',
      strength: '500 mg',
      form: 'Tablet',
      manufacturer: 'Beximco Pharmaceuticals Ltd.',
      price: 1.20,
      hasBilingualDoc: true,
      indicationEn:
          'Fever, headache, toothache, earache, body pain, myalgia, dysmenorrhea.',
      indicationBn:
          'জ্বর, সাধারণ সর্দি ও ফ্লু, মাথা ব্যথা, দাঁতের ব্যথা, কান ব্যথা, শরীর ব্যথা ও অস্থিসন্ধির ব্যথা প্রশমনে নির্দেশিত।',
      sideEffectsEn:
          'Skin rash, mild nausea, rare hematological reactions. Highly safe at therapeutic doses.',
      sideEffectsBn:
          'প্রস্তাবিত মাত্রায় এটি অত্যন্ত নিরাপদ। কদাচিৎ ত্বকে ফুসকুড়ি বা মৃদু বমি ভাব হতে পারে। অতিরিক্ত মাত্রায় লিভারের ক্ষতি হতে পারে।',
      dosageEn:
          'Adults: 1-2 tablets 3 to 4 times daily. Maximum 4000mg per 24 hours.',
      dosageBn:
          'প্রাপ্তবয়স্ক: ১-২টি ট্যাবলেট প্রতি ৪-৬ ঘণ্টা পর পর। ২৪ ঘণ্টায় সর্বোচ্চ ৮টি ট্যাবলেটের বেশি সেবন করা যাবে না। খাবারের পর সেবন শ্রেয়।',
      precautionsBn:
          'লিভার বা কিডনি রোগীদের ক্ষেত্রে চিকিৎসকের পরামর্শ নিয়ে সতর্কতার সাথে সেবন করা উচিত। অ্যালকোহল সেবনের সাথে গ্রহণ নিষিদ্ধ।',
    ),
    MedicineModel(
      brandId: 102,
      brandName: 'Seclo',
      genericName: 'Omeprazole',
      strength: '20 mg',
      form: 'Capsule',
      manufacturer: 'Square Pharmaceuticals Ltd.',
      price: 7.00,
      hasBilingualDoc: true,
      indicationEn:
          'Gastroesophageal reflux disease (GERD), gastric ulcer, duodenal ulcer, acid-related dyspepsia.',
      indicationBn:
          'গ্যাস্ট্রিক আলসার, ডিওডেনাল আলসার, বুকজ্বালা, এসিডিটি এবং অতিরিক্ত এসিড নিঃসরণ জনিত পেটের অস্বস্তিতে নির্দেশিত।',
      sideEffectsEn:
          'Headache, diarrhea, constipation, abdominal pain, flatulence.',
      sideEffectsBn:
          'সাধারণত সুসহনীয়। মাঝে মাঝে মাথা ব্যথা, ডায়রিয়া বা কোষ্ঠকাঠিন্য, পেট ফাঁপা হতে পারে।',
      dosageEn:
          'One 20mg capsule once daily in the morning, 30-60 minutes before meal.',
      dosageBn:
          'প্রতিদিন সকালে খাবার খাওয়ার ৩০ থেকে ৬০ মিনিট আগে ১টি ক্যাপসুল খালি পেটে জল দিয়ে গিলে খেতে হবে।',
      precautionsBn:
          'দীর্ঘদিন অপ্রয়োজনে সেবন করলে ভিটামিন বি১২ ও ক্যালসিয়ামের ঘাটতি হতে পারে। ক্যাপসুল চিবিয়ে খাওয়া যাবে না।',
    ),
    MedicineModel(
      brandId: 103,
      brandName: 'Ciprocin',
      genericName: 'Ciprofloxacin',
      strength: '500 mg',
      form: 'Tablet',
      manufacturer: 'Square Pharmaceuticals Ltd.',
      price: 15.00,
      hasBilingualDoc: true,
      indicationEn:
          'Urinary tract infections (UTI), respiratory tract infections, enteric fever (typhoid), skin infections.',
      indicationBn:
          'মূত্রনালীর সংক্রমণ (UTI), টাইফয়েড জ্বর, শ্বাসনালীর তীব্র সংক্রমণ এবং সংবেদনশীল ব্যাকটেরিয়াজনিত ইনফেকশনে নির্দেশিত।',
      sideEffectsEn:
          'Nausea, abdominal discomfort, dizziness. Rare risk of tendonitis or QT prolongation.',
      sideEffectsBn:
          'বমি বমি ভাব, ডায়রিয়া, মাথা ঘোরানো হতে পারে। বিরল ক্ষেত্রে টেনডন বা পেশির প্রদাহ দেখা দিতে পারে।',
      dosageEn:
          '500mg every 12 hours for 5 to 7 days, as prescribed by doctor. Complete full course.',
      dosageBn:
          'ডাক্তারের পরামর্শ অনুযায়ী প্রতি ১২ ঘণ্টা পর পর ১টি ট্যাবলেট ৫-৭ দিন। অবশ্যই পুরো কোর্স সম্পন্ন করতে হবে।',
      precautionsBn:
          'এন্টাসিড, ক্যালসিয়াম বা দুধ জাতীয় খাদ্যের সাথে এটি সেবন করবেন না (কমপক্ষে ২ ঘণ্টার ব্যবধান রাখুন)। প্রচুর পানি পান করুন।',
    ),
    MedicineModel(
      brandId: 104,
      brandName: 'Ace',
      genericName: 'Paracetamol',
      strength: '500 mg',
      form: 'Tablet',
      manufacturer: 'Square Pharmaceuticals Ltd.',
      price: 1.20,
      hasBilingualDoc: true,
      indicationEn:
          'Pain relief and fever reduction in mild to moderate painful conditions.',
      indicationBn:
          'জ্বর, মাথা ব্যথা ও শরীরের বিভিন্ন ব্যথায় দ্রুত ও কার্যকর ব্যথানাশক।',
      sideEffectsEn: 'Well tolerated. Rare cutaneous allergic manifestations.',
      sideEffectsBn:
          'প্রস্তাবিত মাত্রায় সুসহনীয়। মাঝে মাঝে মৃদু ত্বকের এলার্জি হতে পারে।',
      dosageEn: '1-2 tablets every 4 to 6 hours after meals.',
      dosageBn:
          'প্রাপ্তবয়স্কদের জন্য ১-২টি ট্যাবলেট প্রতি ৪-৬ ঘণ্টা পর পর। খাবারের পর সেব্য।',
      precautionsBn: 'একসাথে প্যারাসিটামলযুক্ত অন্য কোনো ওষুধ সেবন করবেন না।',
    ),
    MedicineModel(
      brandId: 105,
      brandName: 'Monas',
      genericName: 'Montelukast',
      strength: '10 mg',
      form: 'Tablet',
      manufacturer: 'Acme Laboratories Ltd.',
      price: 16.00,
      hasBilingualDoc: true,
      indicationEn:
          'Prophylaxis and chronic treatment of asthma, relief of allergic rhinitis symptoms.',
      indicationBn:
          'অ্যাজমা বা হাঁপানির দীর্ঘমেয়াদী প্রতিরোধ এবং অ্যালার্জিক রাইনাইটিস বা ঠান্ডাজনিত শ্বাসকষ্টের উপশমে নির্দেশিত।',
      sideEffectsEn:
          'Headache, abdominal pain, pharyngitis, rare mood alterations.',
      sideEffectsBn:
          'মাথা ব্যথা, হালকা কাশি বা পেটের অস্বস্তি হতে পারে। কদাচিৎ মেজাজের তারতম্য হতে পারে।',
      dosageEn: 'Adults: One 10mg tablet once daily in the evening.',
      dosageBn: 'প্রতিদিন সন্ধ্যায় খাবার পর ১টি করে ট্যাবলেট নিয়মিত খেতে হবে।',
      precautionsBn:
          'তীব্র হঠাৎ শ্বাসকষ্টের তাত্ক্ষণিক উপশমে ইনহেলার ব্যবহার করতে হবে, এটি দীর্ঘমেয়াদী নিয়ন্ত্রক।',
    ),
    MedicineModel(
      brandId: 106,
      brandName: 'Alatrol',
      genericName: 'Cetirizine Hydrochloride',
      strength: '10 mg',
      form: 'Tablet',
      manufacturer: 'Square Pharmaceuticals Ltd.',
      price: 3.50,
      hasBilingualDoc: true,
      indicationEn:
          'Relief of nasal and ocular symptoms of seasonal & perennial allergic rhinitis, chronic urticaria.',
      indicationBn:
          'অ্যালার্জি, হাঁচি, নাক দিয়ে পানি পড়া, চোখ চুলকানো ও ত্বকের চুলকানি উপশমে দ্রুত কার্যকর।',
      sideEffectsEn: 'Mild drowsiness, fatigue, dry mouth.',
      sideEffectsBn:
          'হালকা ঘুম ঘুম ভাব, ক্লান্তি বা মুখ শুকিয়ে যাওয়ার অনুভূতি হতে পারে।',
      dosageEn: 'Adults: 10mg (one tablet) once daily at night.',
      dosageBn: 'প্রতিদিন রাতে ১টি ট্যাবলেট জল দিয়ে সেব্য।',
      precautionsBn:
          'সেবনের পর গাড়ি বা ভারী যন্ত্রপাতি চালানো পরিহার করুন কারণ হালকা তন্দ্রাচ্ছন্নতা হতে পারে।',
    ),
    MedicineModel(
      brandId: 107,
      brandName: 'Tofen',
      genericName: 'Ketotifen',
      strength: '1 mg / 5ml',
      form: 'Syrup',
      manufacturer: 'Beximco Pharmaceuticals Ltd.',
      price: 65.00,
      hasBilingualDoc: true,
      indicationEn:
          'Bronchial asthma prevention, symptomatic treatment of allergic conditions like rhinitis.',
      indicationBn:
          'ব্রঙ্কিয়াল অ্যাজমা প্রতিরোধ ও শিশুদের অ্যালার্জিজনিত দীর্ঘমেয়াদী কাশি ও সর্দিতে নির্দেশিত।',
      sideEffectsEn: 'Sedation, dizziness, increased appetite.',
      sideEffectsBn:
          'প্রাথমিক দিনগুলোতে হালকা ঘুম ভাব দেখা দিতে পারে যা নিয়মিত সেবনে স্বাভাবিক হয়।',
      dosageEn:
          'Children 3-5 years: 2.5 ml twice daily morning and evening with food.',
      dosageBn: 'চিকিৎসকের পরামর্শ মোতাবেক দিনে ২ বার খাবারের সাথে সেব্য।',
      precautionsBn:
          'চিকিৎসকের পরামর্শ ছাড়া শিশুদের ক্ষেত্রে নিজে থেকে মাত্রা পরিবর্তন করবেন না।',
    ),
    MedicineModel(
      brandId: 108,
      brandName: 'Maxpro',
      genericName: 'Esomeprazole',
      strength: '20 mg',
      form: 'Capsule',
      manufacturer: 'Renata Limited',
      price: 8.00,
      hasBilingualDoc: true,
      indicationEn:
          'Healing of erosive esophagitis, GERD, Zollinger-Ellison syndrome.',
      indicationBn:
          'বুকজ্বালা, গ্যাস্ট্রাইটিস এবং পাকস্থলীর ক্ষতের চিকিৎসায় শক্তিশালী এসিড নিরোধক।',
      sideEffectsEn: 'Headache, dry mouth, nausea, abdominal distension.',
      sideEffectsBn: 'মাথা ব্যথা, পেট ফাঁপা বা মৃদু ডায়রিয়া হতে পারে।',
      dosageEn: '20mg once daily before breakfast.',
      dosageBn:
          'প্রতিদিন সকালে নাস্তার কমপক্ষে ৩০ মিনিট পূর্বে ১টি ক্যাপসুল খালি পেটে খেতে হবে।',
      precautionsBn:
          'অকারণে মাত্রাতিরিক্ত এন্টাসিড বা পিপিআই সেবন থেকে বিরত থাকুন।',
    ),
    MedicineModel(
      brandId: 109,
      brandName: 'Bizoran',
      genericName: 'Amlodipine + Olmesartan',
      strength: '5/20 mg',
      form: 'Tablet',
      manufacturer: 'Square Pharmaceuticals Ltd.',
      price: 14.00,
      hasBilingualDoc: true,
      indicationEn:
          'Treatment of essential hypertension (high blood pressure).',
      indicationBn:
          'উচ্চ রক্তচাপ (Hypertension) নিয়ন্ত্রণে কম্বিনেশন থেরাপি হিসেবে কার্যকর।',
      sideEffectsEn: 'Peripheral edema (ankle swelling), dizziness, headache.',
      sideEffectsBn:
          'মাথা ঘোরা, রক্তচাপ কমে দুর্বল লাগা বা পায়ের গোড়ালি হালকা ফুলতে পারে।',
      dosageEn:
          'One tablet once daily with or without food, as directed by cardiologist.',
      dosageBn:
          'প্রতিদিন নির্দিষ্ট সময়ে চিকিৎসকের পরামর্শ অনুযায়ী ১টি ট্যাবলেট সেব্য। কখনোই নিজে বন্ধ করবেন না।',
      precautionsBn:
          'রক্তচাপ নিয়মিত পরীক্ষা করুন। মাথা ঘুরলে দ্রুত বসে পড়ুন বা শুয়ে পড়ুন।',
    ),
    MedicineModel(
      brandId: 110,
      brandName: 'Pantonix',
      genericName: 'Pantoprazole',
      strength: '20 mg',
      form: 'Tablet',
      manufacturer: 'Incepta Pharmaceuticals Ltd.',
      price: 7.00,
      hasBilingualDoc: true,
      indicationEn:
          'Duodenal and gastric ulcers, moderate and severe reflux esophagitis.',
      indicationBn:
          'পেপটিক আলসার, বুকজ্বালা এবং গ্যাস্ট্রিক এসিড দমনে দ্রুত কাজ করে।',
      sideEffectsEn: 'Rare benign gastric polyps, diarrhea, flatulence.',
      sideEffectsBn: 'পেটে বায়ু জমতে পারে, ডায়রিয়া বা হালকা বমি ভাব হতে পারে।',
      dosageEn: '20mg once or twice daily 30 minutes before meal.',
      dosageBn:
          'খাবারের ৩০ মিনিট পূর্বে প্রতিদিন ১-২ বার চিকিৎসকের নির্দেশ অনুযায়ী সেব্য।',
      precautionsBn:
          'গর্ভাবস্থায় বা স্তন্যদানকালে ডাক্তারের পরামর্শ ছাড়া সেবন করবেন না।',
    ),
  ];
}
