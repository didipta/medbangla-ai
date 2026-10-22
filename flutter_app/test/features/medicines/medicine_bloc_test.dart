import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_app/features/medicines/domain/entities/medicine_entity.dart';
import 'package:flutter_app/features/medicines/domain/usecases/search_medicines_usecase.dart';
import 'package:flutter_app/features/medicines/presentation/bloc/medicine_bloc.dart';
import 'package:flutter_app/features/medicines/presentation/bloc/medicine_event.dart';
import 'package:flutter_app/features/medicines/presentation/bloc/medicine_state.dart';

class MockSearchMedicinesUseCase extends Mock
    implements SearchMedicinesUseCase {}

void main() {
  late MedicineBloc medicineBloc;
  late MockSearchMedicinesUseCase mockSearchUseCase;

  const tMedicine = MedicineEntity(
    brandId: 101,
    brandName: 'Napa',
    genericName: 'Paracetamol',
    strength: '500 mg',
    form: 'Tablet',
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    price: 1.20,
    hasBilingualDoc: true,
  );

  setUp(() {
    mockSearchUseCase = MockSearchMedicinesUseCase();
    medicineBloc = MedicineBloc(searchMedicinesUseCase: mockSearchUseCase);
  });

  tearDown(() {
    medicineBloc.close();
  });

  test('initial state should be MedicineInitialState', () {
    expect(medicineBloc.state, equals(MedicineInitialState()));
  });

  blocTest<MedicineBloc, MedicineState>(
    'emits [MedicineLoadingState, MedicineLoadedState] when SearchMedicinesEvent is added and succeeds',
    build: () {
      when(
        () => mockSearchUseCase.call(any()),
      ).thenAnswer((_) async => [tMedicine]);
      return medicineBloc;
    },
    act: (bloc) => bloc.add(const SearchMedicinesEvent('Napa')),
    expect: () => [
      MedicineLoadingState(),
      const MedicineLoadedState(
        allMedicines: [tMedicine],
        filteredMedicines: [tMedicine],
        selectedForm: 'All',
        query: 'Napa',
      ),
    ],
  );

  blocTest<MedicineBloc, MedicineState>(
    'emits [MedicineLoadingState, MedicineErrorState] when SearchMedicinesEvent fails',
    build: () {
      when(
        () => mockSearchUseCase.call(any()),
      ).thenThrow(Exception('Server error'));
      return medicineBloc;
    },
    act: (bloc) => bloc.add(const SearchMedicinesEvent('Napa')),
    expect: () => [MedicineLoadingState(), isA<MedicineErrorState>()],
  );
}
