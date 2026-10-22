import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/check_interactions_usecase.dart';
import 'interaction_event.dart';
import 'interaction_state.dart';

class InteractionBloc extends Bloc<InteractionEvent, InteractionState> {
  final CheckInteractionsUseCase checkUseCase;
  final List<String> _medicines = ['Ciprofloxacin', 'Antacid'];

  InteractionBloc({required this.checkUseCase})
    : super(InteractionInitialState()) {
    on<CheckMedicinesInteractionEvent>(_onCheck);
    on<AddMedicineToInteractionEvent>(_onAddMedicine);
    on<RemoveMedicineFromInteractionEvent>(_onRemoveMedicine);
  }

  Future<void> _onCheck(
    CheckMedicinesInteractionEvent event,
    Emitter<InteractionState> emit,
  ) async {
    _medicines.clear();
    _medicines.addAll(event.medicines);

    emit(InteractionLoadingState(List.from(_medicines)));
    try {
      final results = await checkUseCase(_medicines);
      emit(
        InteractionLoadedState(
          selectedMedicines: List.from(_medicines),
          interactions: results,
        ),
      );
    } catch (e) {
      emit(InteractionErrorState(e.toString()));
    }
  }

  Future<void> _onAddMedicine(
    AddMedicineToInteractionEvent event,
    Emitter<InteractionState> emit,
  ) async {
    final clean = event.medicineName.trim();
    if (clean.isNotEmpty &&
        !_medicines.any((m) => m.toLowerCase() == clean.toLowerCase())) {
      _medicines.add(clean);
      add(CheckMedicinesInteractionEvent(List.from(_medicines)));
    }
  }

  Future<void> _onRemoveMedicine(
    RemoveMedicineFromInteractionEvent event,
    Emitter<InteractionState> emit,
  ) async {
    _medicines.remove(event.medicineName);
    add(CheckMedicinesInteractionEvent(List.from(_medicines)));
  }
}
