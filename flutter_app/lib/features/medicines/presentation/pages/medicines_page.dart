import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../../../core/widgets/empty_view.dart';
import '../../../../core/widgets/error_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../bloc/medicine_bloc.dart';
import '../bloc/medicine_event.dart';
import '../bloc/medicine_state.dart';
import '../widgets/medicine_card_widget.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../auth/presentation/widgets/auth_modal_sheet.dart';

class MedicinesPage extends StatefulWidget {
  const MedicinesPage({super.key});

  @override
  State<MedicinesPage> createState() => _MedicinesPageState();
}

class _MedicinesPageState extends State<MedicinesPage> {
  final TextEditingController _searchCtrl = TextEditingController();
  final List<String> _forms = [
    'All',
    'Tablet',
    'Capsule',
    'Syrup',
    'Suspension',
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          lang.t('ওষুধের তালিকা (১৭,৫৮৯ ব্র্যান্ড)', 'BD Medicines Directory'),
          style: const TextStyle(fontSize: 16),
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(64),
          child: Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 10),
            child: TextField(
              controller: _searchCtrl,
              onSubmitted: (val) {
                context.read<MedicineBloc>().add(SearchMedicinesEvent(val));
              },
              decoration: InputDecoration(
                hintText: lang.t(
                  'ওষুধের নাম বা জেনেরিক দিয়ে খুঁজুন...',
                  'Search brand or generic...',
                ),
                prefixIcon: const Icon(
                  Icons.search_rounded,
                  color: AppColors.textSecondary,
                ),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          context.read<MedicineBloc>().add(
                            const SearchMedicinesEvent(''),
                          );
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.background,
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 0,
                  horizontal: 16,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: AppColors.primary,
                    width: 1.5,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      body: BlocBuilder<MedicineBloc, MedicineState>(
        builder: (context, state) {
          if (state is MedicineLoadingState) {
            return LoadingView(
              message: lang.t('ওষুধ খোঁজা হচ্ছে...', 'Searching medicines...'),
            );
          } else if (state is MedicineErrorState) {
            return ErrorView(
              message: state.message,
              retryText: lang.t('আবার চেষ্টা করুন', 'Retry'),
              onRetry: () {
                context.read<MedicineBloc>().add(
                  SearchMedicinesEvent(_searchCtrl.text),
                );
              },
            );
          } else if (state is MedicineLoadedState) {
            return Column(
              children: [
                // Auth Gateway Banner (Matches frontend/app/medicines/page.tsx)
                BlocBuilder<AuthBloc, AuthState>(
                  builder: (context, authState) {
                    final isGuest = authState is! AuthenticatedState ||
                        authState.user.isGuest;

                    if (isGuest) {
                      return Container(
                        margin: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFBBF7D0)),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.lock_outline_rounded,
                              size: 16,
                              color: Color(0xFF059669),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                lang.t(
                                  '১৭,৫৮৯ ওষুধের পূর্ণ মনোগ্রাফ আনলক করতে গুগল দিয়ে সাইন-ইন করুন',
                                  'Sign in with Google to unlock full monographs & pricing',
                                ),
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF065F46),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            TextButton(
                              onPressed: () => AuthModalSheet.show(context),
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
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

                    return Container(
                      margin: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.verified_rounded,
                            size: 14,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              lang.t(
                                'ডিজিডিএ অনুমোদিত ১৭,৫৮৯ ওষুধের ডাটাবেজ আনলকড (Verified)',
                                'DGDA Verified: Full 17,589 Medicine Catalog Active',
                              ),
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),

                // Filter Chips
                Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _forms.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final form = _forms[index];
                      final isSelected = state.selectedForm == form;
                      return ChoiceChip(
                        label: Text(form),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) {
                            context.read<MedicineBloc>().add(
                              FilterMedicinesByFormEvent(form),
                            );
                          }
                        },
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : AppColors.textSecondary,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                          fontSize: 12,
                        ),
                        backgroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: BorderSide(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.border,
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Medicines Count Header
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          lang.t(
                            '${state.filteredMedicines.length} টি ওষুধ পাওয়া গেছে',
                            'Found ${state.filteredMedicines.length} medicines',
                          ),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Medicine List
                Expanded(
                  child: state.filteredMedicines.isEmpty
                      ? EmptyView(
                          icon: Icons.medication_outlined,
                          title: lang.t(
                            'কোনো ওষুধ পাওয়া যায়নি',
                            'No medicines found',
                          ),
                          subtitle: lang.t(
                            'অন্য নাম অথবা জেনেরিক দিয়ে চেষ্টা করুন',
                            'Try another brand or generic name',
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                          itemCount: state.filteredMedicines.length,
                          separatorBuilder: (_, _) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final med = state.filteredMedicines[index];
                            return MedicineCardWidget(medicine: med);
                          },
                        ),
                ),
              ],
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}
