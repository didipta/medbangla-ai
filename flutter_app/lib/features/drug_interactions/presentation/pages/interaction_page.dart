import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../../../core/widgets/empty_view.dart';
import '../../../../core/widgets/error_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../bloc/interaction_bloc.dart';
import '../bloc/interaction_event.dart';
import '../bloc/interaction_state.dart';
import '../widgets/interaction_card_widget.dart';

class InteractionPage extends StatefulWidget {
  final List<String>? initialMedicines;

  const InteractionPage({super.key, this.initialMedicines});

  @override
  State<InteractionPage> createState() => _InteractionPageState();
}

class _InteractionPageState extends State<InteractionPage> {
  final TextEditingController _inputCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final initial = widget.initialMedicines ?? ['Ciprofloxacin', 'Antacid'];
      context.read<InteractionBloc>().add(
        CheckMedicinesInteractionEvent(initial),
      );
    });
  }

  @override
  void dispose() {
    _inputCtrl.dispose();
    super.dispose();
  }

  void _addCurrentMedicine() {
    final text = _inputCtrl.text.trim();
    if (text.isNotEmpty) {
      context.read<InteractionBloc>().add(AddMedicineToInteractionEvent(text));
      _inputCtrl.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          lang.t('ড্রাগ ইন্টারঅ্যাকশন ও সেফটি', 'Drug Interactions & Safety'),
          style: const TextStyle(fontSize: 16),
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
        ),
      ),
      body: BlocBuilder<InteractionBloc, InteractionState>(
        builder: (context, state) {
          final List<String> currentMeds;
          if (state is InteractionLoadedState) {
            currentMeds = state.selectedMedicines;
          } else if (state is InteractionLoadingState) {
            currentMeds = state.currentMedicines;
          } else {
            currentMeds =
                widget.initialMedicines ?? ['Ciprofloxacin', 'Antacid'];
          }

          return Column(
            children: [
              // Search / Add medicine bar
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(bottom: BorderSide(color: AppColors.border)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang.t(
                        'একসাথে একাধিক ওষুধ খাওয়ার পার্শ্বপ্রতিক্রিয়া যাচাই করুন:',
                        'Check interactions when taking multiple medicines together:',
                      ),
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _inputCtrl,
                            onSubmitted: (_) => _addCurrentMedicine(),
                            decoration: InputDecoration(
                              hintText: lang.t(
                                'ওষুধ যোগ করুন (উদাঃ Napa, Aspirin)',
                                'Add medicine (e.g. Napa, Aspirin)',
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 0,
                              ),
                              filled: true,
                              fillColor: AppColors.background,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(
                                  color: AppColors.border,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(
                                  color: AppColors.border,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(
                                  color: AppColors.primary,
                                  width: 1.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: _addCurrentMedicine,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                          child: const Icon(Icons.add_rounded),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: currentMeds.map((med) {
                        return Chip(
                          label: Text(med),
                          deleteIcon: const Icon(Icons.close_rounded, size: 16),
                          onDeleted: () {
                            context.read<InteractionBloc>().add(
                              RemoveMedicineFromInteractionEvent(med),
                            );
                          },
                          backgroundColor: AppColors.primaryLight,
                          labelStyle: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                          deleteIconColor: AppColors.primary,
                          side: BorderSide.none,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),

              // Results Area
              Expanded(
                child: Builder(
                  builder: (_) {
                    if (state is InteractionLoadingState) {
                      return LoadingView(
                        message: lang.t(
                          'পারস্পরিক বিক্রিয়া পরীক্ষা চলছে...',
                          'Checking drug interactions...',
                        ),
                      );
                    } else if (state is InteractionErrorState) {
                      return ErrorView(
                        message: state.message,
                        retryText: lang.t('আবার চেষ্টা করুন', 'Retry'),
                        onRetry: () {
                          context.read<InteractionBloc>().add(
                            CheckMedicinesInteractionEvent(currentMeds),
                          );
                        },
                      );
                    } else if (state is InteractionLoadedState) {
                      if (state.interactions.isEmpty) {
                        return EmptyView(
                          icon: Icons.shield_rounded,
                          title: lang.t(
                            'কোনো ক্ষতিকর বিক্রিয়া পাওয়া যায়নি',
                            'No harmful interactions detected',
                          ),
                          subtitle: lang.t(
                            'নির্বাচিত ওষুধগুলো সাধারণত চিকিৎসকের পরামর্শ অনুযায়ী নিরাপদে একসাথে নেওয়া যেতে পারে।',
                            'Selected medicines can generally be taken together under proper physician guidance.',
                          ),
                        );
                      }

                      return ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: state.interactions.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = state.interactions[index];
                          return InteractionCardWidget(interaction: item);
                        },
                      );
                    }

                    return const SizedBox.shrink();
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
