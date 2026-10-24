import '../../../../core/storage/secure_storage_service.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final SecureStorageService storageService;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.storageService,
  });

  @override
  Future<UserEntity> loginDemo({required String role}) async {
    final dto = await remoteDataSource.loginDemo(role: role);
    if (dto.token != null) {
      await storageService.saveToken(dto.token!);
    }
    return dto.toEntity();
  }

  @override
  Future<UserEntity> loginWithGoogle({
    required String credential,
    required String role,
    String? bmdc,
  }) async {
    final dto = await remoteDataSource.loginWithGoogle(
      credential: credential,
      role: role,
      bmdc: bmdc,
    );
    if (dto.token != null) {
      await storageService.saveToken(dto.token!);
    }
    return dto.toEntity();
  }

  @override
  Future<UserEntity?> getCurrentUser() async {
    final token = await storageService.getToken();
    if (token.isEmpty) {
      return null;
    }
    final dto = await remoteDataSource.getCurrentUser(token);
    return dto?.toEntity();
  }

  @override
  Future<void> logout() async {
    await storageService.clearToken();
  }

  @override
  Future<UserEntity> updateRole({
    required String role,
    String? bmdc,
    String? title,
  }) async {
    final token = await storageService.getToken();
    final dto = await remoteDataSource.updateProfile(
      token: token,
      role: role,
      bmdc: bmdc,
      title: title,
    );
    return dto.toEntity();
  }
}
