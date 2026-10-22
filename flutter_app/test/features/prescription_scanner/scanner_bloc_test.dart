import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_app/features/prescription_scanner/domain/entities/prescription_scan_entity.dart';
import 'package:flutter_app/features/prescription_scanner/domain/usecases/scan_prescription_usecase.dart';
import 'package:flutter_app/features/prescription_scanner/presentation/bloc/scanner_bloc.dart';
import 'package:flutter_app/features/prescription_scanner/presentation/bloc/scanner_event.dart';
import 'package:flutter_app/features/prescription_scanner/presentation/bloc/scanner_state.dart';

class MockScanPrescriptionUseCase extends Mock
    implements ScanPrescriptionUseCase {}

void main() {
  late ScannerBloc scannerBloc;
  late MockScanPrescriptionUseCase mockScanUseCase;

  const tScanResult = PrescriptionScanEntity(
    id: 'rx-test',
    doctorName: 'ডাঃ রফিকুল ইসলাম',
    doctorTitle: 'এমবিবিএস, এফসিপিএস (মেডিসিন)',
    patientName: 'করিম হোসেন',
    patientAge: '৪৫ বছর',
    patientGender: 'পুরুষ',
    date: '২২ অক্টোবর ২০২৬',
    diagnosis: 'তীব্র গ্যাস্ট্রাইটিস এবং অ্যাসিড রিফ্লাক্স',
    medicines: [
      DetectedMedicineEntity(
        rawText: 'Tab. Seclo 20mg 1+0+1 ac',
        matchedBrand: 'Seclo',
        matchedGeneric: 'Omeprazole',
        strength: '20 mg',
        form: 'Capsule',
        dosagePattern: '১ + ০ + ১',
        timing: 'খাবারের পূর্বে',
        duration: '১৪ দিন',
        confidence: 0.96,
      ),
    ],
    overallConfidence: 0.94,
  );

  setUp(() {
    mockScanUseCase = MockScanPrescriptionUseCase();
    scannerBloc = ScannerBloc(scanUseCase: mockScanUseCase);
  });

  tearDown(() {
    scannerBloc.close();
  });

  test('initial state should be ScannerInitialState', () {
    expect(scannerBloc.state, equals(ScannerInitialState()));
  });

  blocTest<ScannerBloc, ScannerState>(
    'emits [ScannerLoadingState, ScannerLoadedState] on LoadPresetEvent',
    build: () {
      when(
        () => mockScanUseCase.getPreset(any()),
      ).thenAnswer((_) async => tScanResult);
      return scannerBloc;
    },
    act: (bloc) => bloc.add(const LoadPresetEvent(0)),
    expect: () => [
      ScannerLoadingState(),
      const ScannerLoadedState(result: tScanResult, customImagePath: null),
    ],
  );

  blocTest<ScannerBloc, ScannerState>(
    'emits [ScannerLoadingState, ScannerLoadedState] on ScanImageFileEvent',
    build: () {
      when(
        () => mockScanUseCase.call(any()),
      ).thenAnswer((_) async => tScanResult);
      return scannerBloc;
    },
    act: (bloc) =>
        bloc.add(const ScanImageFileEvent('/path/to/prescription.jpg')),
    expect: () => [
      ScannerLoadingState(),
      const ScannerLoadedState(
        result: tScanResult,
        customImagePath: '/path/to/prescription.jpg',
      ),
    ],
  );
}
