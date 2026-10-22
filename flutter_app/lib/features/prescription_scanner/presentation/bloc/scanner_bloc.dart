import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/prescription_scan_entity.dart';
import '../../domain/usecases/scan_prescription_usecase.dart';
import 'scanner_event.dart';
import 'scanner_state.dart';

class ScannerBloc extends Bloc<ScannerEvent, ScannerState> {
  final ScanPrescriptionUseCase scanUseCase;

  ScannerBloc({required this.scanUseCase}) : super(ScannerInitialState()) {
    on<ScanImageFileEvent>(_onScan);
    on<LoadPresetEvent>(_onLoadPreset);
    on<UpdateMedicineEvent>(_onUpdateMedicine);
    on<DeleteMedicineEvent>(_onDeleteMedicine);
    on<AddMedicineEvent>(_onAddMedicine);
    on<ResetScannerEvent>((event, emit) => emit(ScannerInitialState()));
  }

  Future<void> _onScan(
    ScanImageFileEvent event,
    Emitter<ScannerState> emit,
  ) async {
    emit(ScannerLoadingState());
    try {
      final res = await scanUseCase(event.filePath);
      emit(ScannerLoadedState(result: res, customImagePath: event.filePath));
    } catch (e) {
      emit(ScannerErrorState(e.toString()));
    }
  }

  Future<void> _onLoadPreset(
    LoadPresetEvent event,
    Emitter<ScannerState> emit,
  ) async {
    emit(ScannerLoadingState());
    try {
      final res = await scanUseCase.getPreset(event.presetIndex);
      emit(ScannerLoadedState(result: res, customImagePath: null));
    } catch (e) {
      emit(ScannerErrorState(e.toString()));
    }
  }

  void _onUpdateMedicine(
    UpdateMedicineEvent event,
    Emitter<ScannerState> emit,
  ) {
    if (state is ScannerLoadedState) {
      final loaded = state as ScannerLoadedState;
      final currentList = List<DetectedMedicineEntity>.from(loaded.result.medicines);
      if (event.index >= 0 && event.index < currentList.length) {
        currentList[event.index] = event.medicine;
        final updatedResult = loaded.result.copyWith(medicines: currentList);
        emit(ScannerLoadedState(
          result: updatedResult,
          customImagePath: loaded.customImagePath,
        ));
      }
    }
  }

  void _onDeleteMedicine(
    DeleteMedicineEvent event,
    Emitter<ScannerState> emit,
  ) {
    if (state is ScannerLoadedState) {
      final loaded = state as ScannerLoadedState;
      final currentList = List<DetectedMedicineEntity>.from(loaded.result.medicines);
      if (event.index >= 0 && event.index < currentList.length) {
        currentList.removeAt(event.index);
        final updatedResult = loaded.result.copyWith(medicines: currentList);
        emit(ScannerLoadedState(
          result: updatedResult,
          customImagePath: loaded.customImagePath,
        ));
      }
    }
  }

  void _onAddMedicine(
    AddMedicineEvent event,
    Emitter<ScannerState> emit,
  ) {
    if (state is ScannerLoadedState) {
      final loaded = state as ScannerLoadedState;
      final currentList = List<DetectedMedicineEntity>.from(loaded.result.medicines);
      currentList.add(event.medicine);
      final updatedResult = loaded.result.copyWith(medicines: currentList);
      emit(ScannerLoadedState(
        result: updatedResult,
        customImagePath: loaded.customImagePath,
      ));
    }
  }
}
