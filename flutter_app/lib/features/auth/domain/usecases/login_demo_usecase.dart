import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class LoginDemoUseCase {
  final AuthRepository repository;

  LoginDemoUseCase(this.repository);

  Future<UserEntity> call({String role = 'patient'}) {
    return repository.loginDemo(role: role);
  }
}
