import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:flutter_app/features/auth/domain/entities/user_entity.dart';
import 'package:flutter_app/features/auth/domain/usecases/get_current_user_usecase.dart';
import 'package:flutter_app/features/auth/domain/usecases/login_demo_usecase.dart';
import 'package:flutter_app/features/auth/domain/usecases/login_google_usecase.dart';
import 'package:flutter_app/features/auth/domain/usecases/logout_usecase.dart';
import 'package:flutter_app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:flutter_app/features/auth/presentation/bloc/auth_event.dart';
import 'package:flutter_app/features/auth/presentation/bloc/auth_state.dart';

class MockLoginDemoUseCase extends Mock implements LoginDemoUseCase {}

class MockLoginGoogleUseCase extends Mock implements LoginGoogleUseCase {}

class MockGetCurrentUserUseCase extends Mock implements GetCurrentUserUseCase {}

class MockLogoutUseCase extends Mock implements LogoutUseCase {}

void main() {
  late AuthBloc authBloc;
  late MockLoginDemoUseCase mockLoginDemoUseCase;
  late MockLoginGoogleUseCase mockLoginGoogleUseCase;
  late MockGetCurrentUserUseCase mockGetCurrentUserUseCase;
  late MockLogoutUseCase mockLogoutUseCase;

  const tPatientUser = UserEntity(
    id: 'demo-pat-01',
    email: 'mahdi.hasan@gmail.com',
    name: 'Mahdi Hasan (Demo Patient)',
    role: 'patient',
    token: 'demo-patient-token',
  );

  const tDoctorUser = UserEntity(
    id: 'demo-doc-01',
    email: 'dr.fazlul.hoque@gmail.com',
    name: 'Prof. Dr. Md. Fazlul Hoque',
    role: 'doctor',
    bmdcNumber: 'BMDC-A-42190',
    title: 'Nephrology Specialist',
    token: 'demo-doctor-token',
  );

  setUp(() {
    mockLoginDemoUseCase = MockLoginDemoUseCase();
    mockLoginGoogleUseCase = MockLoginGoogleUseCase();
    mockGetCurrentUserUseCase = MockGetCurrentUserUseCase();
    mockLogoutUseCase = MockLogoutUseCase();

    authBloc = AuthBloc(
      loginDemoUseCase: mockLoginDemoUseCase,
      loginGoogleUseCase: mockLoginGoogleUseCase,
      getCurrentUserUseCase: mockGetCurrentUserUseCase,
      logoutUseCase: mockLogoutUseCase,
    );
  });

  tearDown(() {
    authBloc.close();
  });

  test('initial state should be AuthInitialState', () {
    expect(authBloc.state, equals(AuthInitialState()));
  });

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoadingState, AuthenticatedState] on successful LoginDemoEvent for patient',
    build: () {
      when(
        () => mockLoginDemoUseCase.call(role: any(named: 'role')),
      ).thenAnswer((_) async => tPatientUser);
      return authBloc;
    },
    act: (bloc) => bloc.add(const LoginDemoEvent(role: 'patient')),
    expect: () => [AuthLoadingState(), const AuthenticatedState(tPatientUser)],
  );

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoadingState, AuthenticatedState] on successful LoginDemoEvent for doctor',
    build: () {
      when(
        () => mockLoginDemoUseCase.call(role: any(named: 'role')),
      ).thenAnswer((_) async => tDoctorUser);
      return authBloc;
    },
    act: (bloc) => bloc.add(const LoginDemoEvent(role: 'doctor')),
    expect: () => [AuthLoadingState(), const AuthenticatedState(tDoctorUser)],
  );

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoadingState, AuthenticatedState] on LoginGoogleEvent',
    build: () {
      when(
        () => mockLoginGoogleUseCase.call(
          credential: any(named: 'credential'),
          role: any(named: 'role'),
          bmdc: any(named: 'bmdc'),
        ),
      ).thenAnswer((_) async => tPatientUser);
      return authBloc;
    },
    act: (bloc) => bloc.add(
      const LoginGoogleEvent(credential: 'google-test-token', role: 'patient'),
    ),
    expect: () => [AuthLoadingState(), const AuthenticatedState(tPatientUser)],
  );

  blocTest<AuthBloc, AuthState>(
    'emits [AuthLoadingState, UnauthenticatedState] on LogoutEvent',
    build: () {
      when(() => mockLogoutUseCase.call()).thenAnswer((_) async => {});
      return authBloc;
    },
    act: (bloc) => bloc.add(LogoutEvent()),
    expect: () => [AuthLoadingState(), const UnauthenticatedState()],
  );
}
