import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'app.dart';
import 'core/utils/app_bloc_observer.dart';
import 'di/injection.dart';
import 'services/app_control_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Dynamically load real app version & build code from pubspec.yaml
  await AppControlService.initVersionInfo();

  // Set system UI overlay style matching MedBangla AI aesthetic
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize Clean Architecture Dependency Injection (GetIt)
  await initDependencies();

  // Initialize BLoC state transition logging
  Bloc.observer = AppBlocObserver();

  runApp(const MedBanglaCleanApp());
}
