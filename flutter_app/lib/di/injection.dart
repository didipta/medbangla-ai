import 'package:get_it/get_it.dart';
import '../core/network/dio_client.dart';
import '../core/services/google_auth_service.dart';
import '../core/storage/secure_storage_service.dart';
import '../features/auth/data/datasources/auth_remote_datasource.dart';
import '../features/auth/data/repositories/auth_repository_impl.dart';
import '../features/auth/domain/repositories/auth_repository.dart';
import '../features/auth/domain/usecases/get_current_user_usecase.dart';
import '../features/auth/domain/usecases/login_demo_usecase.dart';
import '../features/auth/domain/usecases/login_google_usecase.dart';
import '../features/auth/domain/usecases/logout_usecase.dart';
import '../features/auth/presentation/bloc/auth_bloc.dart';
import '../features/clinical_chat/data/datasources/chat_remote_datasource.dart';
import '../features/clinical_chat/data/repositories/chat_repository_impl.dart';
import '../features/clinical_chat/domain/repositories/chat_repository.dart';
import '../features/clinical_chat/domain/usecases/send_chat_message_usecase.dart';
import '../features/clinical_chat/presentation/bloc/chat_bloc.dart';
import '../features/drug_interactions/data/datasources/interaction_remote_datasource.dart';
import '../features/drug_interactions/data/repositories/interaction_repository_impl.dart';
import '../features/drug_interactions/domain/repositories/interaction_repository.dart';
import '../features/drug_interactions/domain/usecases/check_interactions_usecase.dart';
import '../features/drug_interactions/presentation/bloc/interaction_bloc.dart';
import '../features/medicines/data/datasources/medicine_remote_datasource.dart';
import '../features/medicines/data/repositories/medicine_repository_impl.dart';
import '../features/medicines/domain/repositories/medicine_repository.dart';
import '../features/medicines/domain/usecases/search_medicines_usecase.dart';
import '../features/medicines/presentation/bloc/medicine_bloc.dart';
import '../features/prescription_scanner/data/datasources/scanner_remote_datasource.dart';
import '../features/prescription_scanner/data/repositories/scanner_repository_impl.dart';
import '../features/prescription_scanner/domain/repositories/scanner_repository.dart';
import '../features/prescription_scanner/domain/usecases/scan_prescription_usecase.dart';
import '../features/prescription_scanner/presentation/bloc/scanner_bloc.dart';

final sl = GetIt.instance;

Future<void> initDependencies() async {
  // 1. Storage & Core Services
  sl.registerLazySingleton<SecureStorageService>(() => SecureStorageService());
  sl.registerLazySingleton<GoogleAuthService>(() => GoogleAuthService());

  // 2. Network Client
  sl.registerLazySingleton<DioClient>(() => DioClient(storage: sl()));

  // 3. Data Sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(dioClient: sl()),
  );
  sl.registerLazySingleton<MedicineRemoteDataSource>(
    () => MedicineRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<ScannerRemoteDataSource>(
    () => ScannerRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<InteractionRemoteDataSource>(
    () => InteractionRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<ChatRemoteDataSource>(
    () => ChatRemoteDataSourceImpl(sl()),
  );

  // 4. Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(remoteDataSource: sl(), storageService: sl()),
  );
  sl.registerLazySingleton<MedicineRepository>(
    () => MedicineRepositoryImpl(sl()),
  );
  sl.registerLazySingleton<ScannerRepository>(
    () => ScannerRepositoryImpl(sl()),
  );
  sl.registerLazySingleton<InteractionRepository>(
    () => InteractionRepositoryImpl(sl()),
  );
  sl.registerLazySingleton<ChatRepository>(() => ChatRepositoryImpl(sl()));

  // 5. Use Cases
  sl.registerLazySingleton(() => LoginDemoUseCase(sl()));
  sl.registerLazySingleton(() => LoginGoogleUseCase(sl()));
  sl.registerLazySingleton(() => GetCurrentUserUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));
  sl.registerLazySingleton(() => SearchMedicinesUseCase(sl()));
  sl.registerLazySingleton(() => ScanPrescriptionUseCase(sl()));
  sl.registerLazySingleton(() => CheckInteractionsUseCase(sl()));
  sl.registerLazySingleton(() => SendChatMessageUseCase(sl()));

  // 6. BLoCs
  sl.registerFactory(
    () => AuthBloc(
      loginDemoUseCase: sl(),
      loginGoogleUseCase: sl(),
      getCurrentUserUseCase: sl(),
      logoutUseCase: sl(),
    ),
  );
  sl.registerFactory(() => MedicineBloc(searchMedicinesUseCase: sl()));
  sl.registerFactory(() => ScannerBloc(scanUseCase: sl()));
  sl.registerFactory(() => InteractionBloc(checkUseCase: sl()));
  sl.registerFactory(() => ChatBloc(sendUseCase: sl()));
}
