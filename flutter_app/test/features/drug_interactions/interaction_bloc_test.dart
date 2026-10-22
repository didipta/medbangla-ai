import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_app/features/drug_interactions/domain/entities/interaction_entity.dart';
import 'package:flutter_app/features/drug_interactions/domain/usecases/check_interactions_usecase.dart';
import 'package:flutter_app/features/drug_interactions/presentation/bloc/interaction_bloc.dart';
import 'package:flutter_app/features/drug_interactions/presentation/bloc/interaction_event.dart';
import 'package:flutter_app/features/drug_interactions/presentation/bloc/interaction_state.dart';

class MockCheckInteractionsUseCase extends Mock
    implements CheckInteractionsUseCase {}

void main() {
  late InteractionBloc interactionBloc;
  late MockCheckInteractionsUseCase mockCheckUseCase;

  const tInteraction = InteractionEntity(
    medicineA: 'Ciprofloxacin',
    medicineB: 'Antacid',
    severity: ClinicalSeverity.critical,
    severityBn: 'উচ্চ ঝুঁকি (High Risk)',
    titleBn: 'অ্যান্টিবায়োটিক শোষণ ব্যাহত',
    titleEn: 'Severely Reduced Antibiotic Absorption',
    descriptionBn:
        'ম্যাগনেসিয়াম বা অ্যালুমিনিয়াম সিপ্রোফ্লক্সাসিনের শোষণ ৯০% পর্যন্ত কমিয়ে দেয়।',
    descriptionEn: 'Magnesium or aluminium cations bind to ciprofloxacin.',
    clinicalRecommendationBn:
        'অ্যান্টাসিড খাওয়ার অন্তত ২ ঘণ্টা পূর্বে সিপ্রোফ্লক্সাসিন সেবন করুন।',
  );

  setUp(() {
    mockCheckUseCase = MockCheckInteractionsUseCase();
    interactionBloc = InteractionBloc(checkUseCase: mockCheckUseCase);
  });

  tearDown(() {
    interactionBloc.close();
  });

  test('initial state should be InteractionInitialState', () {
    expect(interactionBloc.state, equals(InteractionInitialState()));
  });

  blocTest<InteractionBloc, InteractionState>(
    'emits [InteractionLoadingState, InteractionLoadedState] on CheckMedicinesInteractionEvent',
    build: () {
      when(
        () => mockCheckUseCase.call(any()),
      ).thenAnswer((_) async => [tInteraction]);
      return interactionBloc;
    },
    act: (bloc) => bloc.add(
      const CheckMedicinesInteractionEvent(['Ciprofloxacin', 'Antacid']),
    ),
    expect: () => [
      const InteractionLoadingState(['Ciprofloxacin', 'Antacid']),
      const InteractionLoadedState(
        selectedMedicines: ['Ciprofloxacin', 'Antacid'],
        interactions: [tInteraction],
      ),
    ],
  );
}
