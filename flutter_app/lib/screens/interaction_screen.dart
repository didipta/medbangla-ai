import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import '../models/interaction_model.dart';
import '../services/auth_service.dart';
import '../services/interaction_service.dart';

class InteractionScreen extends StatefulWidget {
  final List<String>? initialMedicines;

  const InteractionScreen({super.key, this.initialMedicines});

  @override
  State<InteractionScreen> createState() => _InteractionScreenState();
}

class _InteractionScreenState extends State<InteractionScreen> {
  final InteractionService _service = InteractionService();
  final TextEditingController _medCtrl = TextEditingController();

  final List<String> _selectedMedicines = ['Ciprofloxacin', 'Antacid'];
  List<DrugInteractionItem> _interactions = [];
  bool _isChecking = false;
  bool _hasChecked = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialMedicines != null &&
        widget.initialMedicines!.isNotEmpty) {
      _selectedMedicines.clear();
      _selectedMedicines.addAll(widget.initialMedicines!);
    }
    _runCheck();
  }

  Future<void> _runCheck() async {
    if (_selectedMedicines.length < 2) {
      setState(() {
        _interactions = [];
        _hasChecked = true;
      });
      return;
    }

    setState(() => _isChecking = true);
    final auth = Provider.of<AuthService>(context, listen: false);
    final results = await _service.checkInteractions(
      _selectedMedicines,
      token: auth.token,
    );

    setState(() {
      _interactions = results;
      _isChecking = false;
      _hasChecked = true;
    });
  }

  void _addMedicine(String name) {
    final clean = name.trim();
    if (clean.isNotEmpty &&
        !_selectedMedicines.any(
          (m) => m.toLowerCase() == clean.toLowerCase(),
        )) {
      setState(() {
        _selectedMedicines.add(clean);
        _medCtrl.clear();
      });
      _runCheck();
    }
  }

  void _removeMedicine(String name) {
    setState(() {
      _selectedMedicines.remove(name);
    });
    _runCheck();
  }

  void _loadPreset(List<String> meds) {
    setState(() {
      _selectedMedicines.clear();
      _selectedMedicines.addAll(meds);
    });
    _runCheck();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          lang.t('ড্রাগ-ড্রাগ ইন্টারঅ্যাকশন সেফটি', 'Drug Interaction Checker'),
        ),
        actions: [
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    lang.t(
                      'ডিজিডিএ ও আন্তর্জাতিক ফার্মাকোপিয়া মানদণ্ড অনুযায়ী ক্ষতিকর ড্রাগ মিথস্ক্রিয়া যাচাই করা হয়।',
                      'Drug interaction triage grounded in DGDA and pharmacopeia standards.',
                    ),
                  ),
                ),
              );
            },
            icon: const Icon(Icons.info_outline_rounded),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Input Panel
          _buildInputPanel(context, lang),
          const SizedBox(height: 14),

          // Preset Examples Strip
          _buildPresetStrip(context, lang),
          const SizedBox(height: 16),

          // Triage Status Header
          if (_hasChecked) _buildSafetyStatusBanner(context, lang),
          const SizedBox(height: 14),

          // Interaction Warning Cards
          if (_isChecking)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            )
          else if (_interactions.isEmpty && _hasChecked)
            _buildSafeCard(context, lang)
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _interactions.length,
              separatorBuilder: (ctx, idx) => const SizedBox(height: 12),
              itemBuilder: (ctx, idx) =>
                  _buildInteractionCard(context, lang, _interactions[idx]),
            ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildInputPanel(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            lang.t(
              'একত্রে সেবনরত ওষুধসমূহ যোগ করুন',
              'Add Concurrent Medications',
            ),
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),

          // Chips of selected meds
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _selectedMedicines.map((med) {
              return Chip(
                label: Text(
                  med,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryDark,
                  ),
                ),
                backgroundColor: AppColors.primaryLight,
                deleteIcon: const Icon(
                  Icons.close_rounded,
                  size: 16,
                  color: AppColors.primaryDark,
                ),
                onDeleted: () => _removeMedicine(med),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: const BorderSide(color: AppColors.primarySurface),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 12),

          // Add med input
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _medCtrl,
                  decoration: InputDecoration(
                    hintText: lang.t(
                      'ওষুধের নাম লিখুন (e.g. Aspirin)...',
                      'Enter drug name...',
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                  ),
                  onSubmitted: _addMedicine,
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () => _addMedicine(_medCtrl.text),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                ),
                child: const Text('Add'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPresetStrip(BuildContext context, LanguageProvider lang) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          lang.t(
            'পরীক্ষা করার জন্য নমুনা ড্রাগ কম্বিনেশন:',
            'Quick High-Risk Sample Pairs:',
          ),
          style: const TextStyle(
            fontSize: 11.5,
            color: AppColors.textMuted,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildPresetChip('Ciprofloxacin + Antacid', [
                'Ciprofloxacin',
                'Antacid',
              ]),
              const SizedBox(width: 8),
              _buildPresetChip('Napa + Ace (Overdose)', ['Napa', 'Ace']),
              const SizedBox(width: 8),
              _buildPresetChip('Seclo + Clopidogrel', ['Seclo', 'Clopidogrel']),
              const SizedBox(width: 8),
              _buildPresetChip('Aspirin + Warfarin', ['Aspirin', 'Warfarin']),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPresetChip(String title, List<String> pair) {
    return ActionChip(
      label: Text(
        title,
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
      ),
      backgroundColor: Colors.white,
      side: const BorderSide(color: AppColors.border),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      onPressed: () => _loadPreset(pair),
    );
  }

  Widget _buildSafetyStatusBanner(BuildContext context, LanguageProvider lang) {
    final bool hasCritical = _interactions.any(
      (i) => i.severity == InteractionSeverity.critical,
    );
    final bool hasWarning = _interactions.any(
      (i) => i.severity == InteractionSeverity.warning,
    );

    Color bg = AppColors.emeraldBg;
    Color border = const Color(0xFFA7F3D0);
    Color textColor = AppColors.emerald;
    IconData icon = Icons.check_circle_rounded;
    String title = lang.t(
      'নিরাপদ কম্বিনেশন — কোনো ক্ষতিকর বিক্রিয়া পাওয়া যায়নি',
      'Safe — No Documented Major Interactions Found',
    );

    if (hasCritical) {
      bg = AppColors.alertCriticalBg;
      border = const Color(0xFFFECDD3);
      textColor = AppColors.alertCritical;
      icon = Icons.dangerous_rounded;
      title = lang.t(
        'মারাত্মক ঝুঁকি সনাক্ত — চিকিৎসকের পরামর্শ নিন!',
        'Critical Safety Risk Detected — Consult Doctor!',
      );
    } else if (hasWarning) {
      bg = AppColors.alertWarningBg;
      border = const Color(0xFFFDE68A);
      textColor = AppColors.alertWarning;
      icon = Icons.warning_amber_rounded;
      title = lang.t(
        'সতর্কতা প্রয়োজন — সেবনের ব্যবধান মেনে চলুন',
        'Clinical Caution Advised — Space Dosing Apart',
      );
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border, width: 1.2),
      ),
      child: Row(
        children: [
          Icon(icon, color: textColor, size: 24),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSafeCard(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.thumb_up_alt_rounded,
            color: AppColors.emerald,
            size: 36,
          ),
          const SizedBox(height: 10),
          Text(
            lang.t(
              'কোনো ক্ষতিকর ড্রাগ মিথস্ক্রিয়া পাওয়া যায়নি',
              'No Documented Dangerous Interactions',
            ),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            lang.t(
              'নির্বাচিত ওষুধগুলো সাধারণত একত্রে নিরাপদ। তবে নির্দেশিত মাত্রার অতিরিক্ত গ্রহণ করবেন না।',
              'The selected medications are generally safe together within therapeutic doses.',
            ),
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildInteractionCard(
    BuildContext context,
    LanguageProvider lang,
    DrugInteractionItem item,
  ) {
    final bool isCritical = item.severity == InteractionSeverity.critical;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCritical ? const Color(0xFFFECDD3) : const Color(0xFFFDE68A),
          width: 1.5,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with Drugs + Severity Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '${item.medicineA}  ⟷  ${item.medicineB}',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isCritical
                      ? AppColors.alertCriticalBg
                      : AppColors.alertWarningBg,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  item.severityBn,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isCritical
                        ? AppColors.alertCritical
                        : AppColors.alertWarning,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            lang.isBangla ? item.titleBn : item.titleEn,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: isCritical
                  ? AppColors.alertCritical
                  : AppColors.alertWarning,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            lang.isBangla ? item.descriptionBn : item.descriptionEn,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.medical_information_rounded,
                  size: 16,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    item.clinicalRecommendationBn,
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
