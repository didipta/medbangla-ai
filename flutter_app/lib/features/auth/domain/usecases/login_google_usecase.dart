import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class LoginGoogleUseCase {
  final AuthRepository repository;

  LoginGoogleUseCase(this.repository);

  Future<UserEntity> call({
    required String credential,
    String role = 'patient',
    String? bmdc,
  }) {
    return repository.loginWithGoogle(
      credential: credential,
      role: role,
      bmdc: bmdc,
    );
  }
}
