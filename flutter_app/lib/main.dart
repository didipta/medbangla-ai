import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'app.dart';
import 'core/utils/app_bloc_observer.dart';
import 'di/injection.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

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
