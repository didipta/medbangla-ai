import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> loginDemo({required String role});
  Future<UserEntity> loginWithGoogle({
    required String credential,
    required String role,
    String? bmdc,
  });
  Future<UserEntity?> getCurrentUser();
  Future<void> logout();
  Future<UserEntity> updateRole({
    required String role,
    String? bmdc,
    String? title,
  });
}
