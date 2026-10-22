import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/search_medicines_usecase.dart';
import 'medicine_event.dart';
import 'medicine_state.dart';

class MedicineBloc extends Bloc<MedicineEvent, MedicineState> {
  final SearchMedicinesUseCase searchMedicinesUseCase;

  MedicineBloc({required this.searchMedicinesUseCase})
    : super(MedicineInitialState()) {
    on<SearchMedicinesEvent>(_onSearch);
    on<FilterMedicinesByFormEvent>(_onFilter);
  }

  Future<void> _onSearch(
    SearchMedicinesEvent event,
    Emitter<MedicineState> emit,
  ) async {
    emit(MedicineLoadingState());
    try {
      final results = await searchMedicinesUseCase(event.query);
      final filtered = event.formFilter == 'All'
          ? results
          : results
                .where(
                  (m) => m.form.toLowerCase().contains(
                    event.formFilter.toLowerCase(),
                  ),
                )
                .toList();

      emit(
        MedicineLoadedState(
          allMedicines: results,
          filteredMedicines: filtered,
          selectedForm: event.formFilter,
          query: event.query,
        ),
      );
    } catch (e) {
      emit(MedicineErrorState(e.toString()));
    }
  }

  void _onFilter(
    FilterMedicinesByFormEvent event,
    Emitter<MedicineState> emit,
  ) {
    if (state is MedicineLoadedState) {
      final currentState = state as MedicineLoadedState;
      final filtered = event.form == 'All'
          ? currentState.allMedicines
          : currentState.allMedicines
                .where(
                  (m) =>
                      m.form.toLowerCase().contains(event.form.toLowerCase()),
                )
                .toList();

      emit(
        currentState.copyWith(
          filteredMedicines: filtered,
          selectedForm: event.form,
        ),
      );
    }
  }
}
