import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_current_user_usecase.dart';
import '../../domain/usecases/login_demo_usecase.dart';
import '../../domain/usecases/login_google_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginDemoUseCase loginDemoUseCase;
  final LoginGoogleUseCase loginGoogleUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;
  final LogoutUseCase logoutUseCase;

  AuthBloc({
    required this.loginDemoUseCase,
    required this.loginGoogleUseCase,
    required this.getCurrentUserUseCase,
    required this.logoutUseCase,
  }) : super(AuthInitialState()) {
    on<CheckAuthSessionEvent>(_onCheckSession);
    on<LoginDemoEvent>(_onLoginDemo);
    on<LoginGoogleEvent>(_onLoginGoogle);
    on<LogoutEvent>(_onLogout);
  }

  Future<void> _onCheckSession(
    CheckAuthSessionEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoadingState());
    try {
      final user = await getCurrentUserUseCase();
      if (user != null) {
        emit(AuthenticatedState(user));
      } else {
        emit(const UnauthenticatedState());
      }
    } catch (_) {
      emit(const UnauthenticatedState());
    }
  }

  Future<void> _onLoginDemo(
    LoginDemoEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoadingState());
    try {
      final user = await loginDemoUseCase(role: event.role);
      emit(AuthenticatedState(user));
    } catch (e) {
      emit(AuthErrorState(e.toString()));
    }
  }

  Future<void> _onLoginGoogle(
    LoginGoogleEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoadingState());
    try {
      final user = await loginGoogleUseCase(
        credential: event.credential,
        role: event.role,
        bmdc: event.bmdc,
      );
      emit(AuthenticatedState(user));
    } catch (e) {
      emit(AuthErrorState(e.toString()));
    }
  }

  Future<void> _onLogout(LogoutEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());
    await logoutUseCase();
    emit(const UnauthenticatedState());
  }
}
