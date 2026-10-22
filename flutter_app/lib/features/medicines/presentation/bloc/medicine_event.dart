import 'package:equatable/equatable.dart';

abstract class MedicineEvent extends Equatable {
  const MedicineEvent();

  @override
  List<Object?> get props => [];
}

class SearchMedicinesEvent extends MedicineEvent {
  final String query;
  final String formFilter;

  const SearchMedicinesEvent(this.query, {this.formFilter = 'All'});

  @override
  List<Object?> get props => [query, formFilter];
}

class FilterMedicinesByFormEvent extends MedicineEvent {
  final String form;

  const FilterMedicinesByFormEvent(this.form);

  @override
  List<Object?> get props => [form];
}
