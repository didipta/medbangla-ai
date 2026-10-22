import 'package:equatable/equatable.dart';
import '../../domain/entities/medicine_entity.dart';

abstract class MedicineState extends Equatable {
  const MedicineState();

  @override
  List<Object?> get props => [];
}

class MedicineInitialState extends MedicineState {}

class MedicineLoadingState extends MedicineState {}

class MedicineLoadedState extends MedicineState {
  final List<MedicineEntity> allMedicines;
  final List<MedicineEntity> filteredMedicines;
  final String selectedForm;
  final String query;

  const MedicineLoadedState({
    required this.allMedicines,
    required this.filteredMedicines,
    this.selectedForm = 'All',
    this.query = '',
  });

  @override
  List<Object?> get props => [
    allMedicines,
    filteredMedicines,
    selectedForm,
    query,
  ];

  MedicineLoadedState copyWith({
    List<MedicineEntity>? allMedicines,
    List<MedicineEntity>? filteredMedicines,
    String? selectedForm,
    String? query,
  }) {
    return MedicineLoadedState(
      allMedicines: allMedicines ?? this.allMedicines,
      filteredMedicines: filteredMedicines ?? this.filteredMedicines,
      selectedForm: selectedForm ?? this.selectedForm,
      query: query ?? this.query,
    );
  }
}

class MedicineErrorState extends MedicineState {
  final String message;

  const MedicineErrorState(this.message);

  @override
  List<Object?> get props => [message];
}
