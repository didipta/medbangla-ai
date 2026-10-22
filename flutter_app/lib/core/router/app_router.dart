import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/pages/profile_page.dart';
import '../../features/clinical_chat/presentation/pages/chat_page.dart';
import '../../features/dashboard/presentation/pages/main_shell_page.dart';
import '../../features/drug_interactions/presentation/pages/interaction_page.dart';
import '../../features/medicines/presentation/pages/medicines_page.dart';
import '../../features/prescription_scanner/presentation/pages/scanner_page.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

class AppRouter {
  static final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'root',
        builder: (context, state) => const MainShellPage(),
      ),
      GoRoute(
        path: '/medicines',
        name: 'medicines',
        builder: (context, state) => const MedicinesPage(),
      ),
      GoRoute(
        path: '/scanner',
        name: 'scanner',
        builder: (context, state) => const ScannerPage(),
      ),
      GoRoute(
        path: '/interactions',
        name: 'interactions',
        builder: (context, state) => const InteractionPage(),
      ),
      GoRoute(
        path: '/chat',
        name: 'chat',
        builder: (context, state) => const ChatPage(),
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfilePage(),
      ),
    ],
  );
}
