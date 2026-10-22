import 'package:equatable/equatable.dart';

abstract class InteractionEvent extends Equatable {
  const InteractionEvent();

  @override
  List<Object?> get props => [];
}

class CheckMedicinesInteractionEvent extends InteractionEvent {
  final List<String> medicines;

  const CheckMedicinesInteractionEvent(this.medicines);

  @override
  List<Object?> get props => [medicines];
}

class AddMedicineToInteractionEvent extends InteractionEvent {
  final String medicineName;

  const AddMedicineToInteractionEvent(this.medicineName);

  @override
  List<Object?> get props => [medicineName];
}

class RemoveMedicineFromInteractionEvent extends InteractionEvent {
  final String medicineName;

  const RemoveMedicineFromInteractionEvent(this.medicineName);

  @override
  List<Object?> get props => [medicineName];
}
