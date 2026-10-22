import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'core/localization/language_provider.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'di/injection.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/presentation/bloc/auth_event.dart';
import 'features/clinical_chat/presentation/bloc/chat_bloc.dart';
import 'features/drug_interactions/presentation/bloc/interaction_bloc.dart';
import 'features/medicines/presentation/bloc/medicine_bloc.dart';
import 'features/medicines/presentation/bloc/medicine_event.dart';
import 'features/prescription_scanner/presentation/bloc/scanner_bloc.dart';
import 'services/auth_service.dart';

class MedBanglaCleanApp extends StatelessWidget {
  const MedBanglaCleanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => AuthService()),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (_) => sl<AuthBloc>()..add(CheckAuthSessionEvent()),
          ),
          BlocProvider<MedicineBloc>(
            create: (_) =>
                sl<MedicineBloc>()..add(const SearchMedicinesEvent('')),
          ),
          BlocProvider<ScannerBloc>(
            create: (_) => sl<ScannerBloc>(),
          ),
          BlocProvider<InteractionBloc>(create: (_) => sl<InteractionBloc>()),
          BlocProvider<ChatBloc>(create: (_) => sl<ChatBloc>()),
        ],
        child: Consumer<LanguageProvider>(
          builder: (context, lang, child) {
            return MaterialApp.router(
              title: 'MedBangla AI',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme,
              locale: Locale(lang.code),
              routerConfig: AppRouter.router,
            );
          },
        ),
      ),
    );
  }
}
