import 'package:equatable/equatable.dart';
import '../../domain/entities/interaction_entity.dart';

abstract class InteractionState extends Equatable {
  const InteractionState();

  @override
  List<Object?> get props => [];
}

class InteractionInitialState extends InteractionState {}

class InteractionLoadingState extends InteractionState {
  final List<String> currentMedicines;

  const InteractionLoadingState(this.currentMedicines);

  @override
  List<Object?> get props => [currentMedicines];
}

class InteractionLoadedState extends InteractionState {
  final List<String> selectedMedicines;
  final List<InteractionEntity> interactions;
  final bool hasChecked;

  const InteractionLoadedState({
    required this.selectedMedicines,
    required this.interactions,
    this.hasChecked = true,
  });

  @override
  List<Object?> get props => [selectedMedicines, interactions, hasChecked];
}

class InteractionErrorState extends InteractionState {
  final String message;

  const InteractionErrorState(this.message);

  @override
  List<Object?> get props => [message];
}
