import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import '../models/medicine_model.dart';
import '../services/auth_service.dart';
import '../services/medicine_service.dart';
import '../widgets/medicine_card.dart';

class MedicinesScreen extends StatefulWidget {
  const MedicinesScreen({super.key});

  @override
  State<MedicinesScreen> createState() => _MedicinesScreenState();
}

class _MedicinesScreenState extends State<MedicinesScreen> {
  final MedicineService _service = MedicineService();
  final TextEditingController _searchCtrl = TextEditingController();

  List<MedicineModel> _medicines = [];
  bool _isLoading = false;
  String _selectedForm = 'All';

  final List<String> _forms = [
    'All',
    'Tablet',
    'Capsule',
    'Syrup',
    'Suspension',
  ];

  @override
  void initState() {
    super.initState();
    _fetchMedicines('');
  }

  Future<void> _fetchMedicines(String query) async {
    setState(() => _isLoading = true);
    final auth = Provider.of<AuthService>(context, listen: false);
    final results = await _service.searchMedicines(query, token: auth.token);

    setState(() {
      _medicines = results;
      _isLoading = false;
    });
  }

  List<MedicineModel> get _filteredMedicines {
    if (_selectedForm == 'All') return _medicines;
    return _medicines
        .where(
          (m) => m.form.toLowerCase().contains(_selectedForm.toLowerCase()),
        )
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          lang.t('ওষুধের তালিকা (১৭,৫৮৯ ব্র্যান্ড)', 'BD Medicines Directory'),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (val) => _fetchMedicines(val),
              decoration: InputDecoration(
                hintText: lang.t(
                  'ব্র্যান্ড বা জেনেরিক নাম লিখুন (e.g. Napa, Seclo)...',
                  'Search brand or generic name...',
                ),
                prefixIcon: const Icon(
                  Icons.search_rounded,
                  color: AppColors.primary,
                ),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          _fetchMedicines('');
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
              ),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            height: 46,
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _forms.length,
              separatorBuilder: (ctx, idx) => const SizedBox(width: 8),
              itemBuilder: (ctx, idx) {
                final form = _forms[idx];
                final isSelected = _selectedForm == form;
                return ChoiceChip(
                  label: Text(
                    form == 'All' ? lang.t('সকল ওষুধ', 'All Forms') : form,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                      color: isSelected
                          ? Colors.white
                          : AppColors.textSecondary,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected ? AppColors.primary : AppColors.border,
                    ),
                  ),
                  onSelected: (val) {
                    setState(() => _selectedForm = form);
                  },
                );
              },
            ),
          ),

          // Count Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${lang.t("মোট ফলাফল:", "Total Found:")} ${_filteredMedicines.length}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  lang.t('ডিজিডিএ রেগুলেটেড মূল্য', 'DGDA Regulated Price'),
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.primaryDark,
                  ),
                ),
              ],
            ),
          ),

          // Medicine List
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : _filteredMedicines.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.search_off_rounded,
                          size: 48,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          lang.t('কোনো ওষুধ পাওয়া যায়নি', 'No medicines found'),
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          lang.t(
                            'অন্য কোনো বানান চেষ্টা করুন',
                            'Try a different brand or generic keyword',
                          ),
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredMedicines.length,
                    separatorBuilder: (ctx, idx) => const SizedBox(height: 10),
                    itemBuilder: (ctx, idx) {
                      return MedicineCard(medicine: _filteredMedicines[idx]);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
