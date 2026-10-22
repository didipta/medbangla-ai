import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import 'home_screen.dart';
import 'scanner_screen.dart';
import 'medicines_screen.dart';
import 'interaction_screen.dart';
import 'chat_screen.dart';
import 'profile_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  List<String>? _passedMedicinesForCheck;

  void _navigateToTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _checkSafetyForMeds(List<String> medicines) {
    setState(() {
      _passedMedicinesForCheck = medicines;
      _currentIndex = 3; // Switch to Interactions tab
    });
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    final List<Widget> screens = [
      HomeScreen(onNavigateTab: _navigateToTab),
      ScannerScreen(onCheckMedsSafety: _checkSafetyForMeds),
      const MedicinesScreen(),
      InteractionScreen(
        key: ValueKey(_passedMedicinesForCheck?.join(',') ?? 'default'),
        initialMedicines: _passedMedicinesForCheck,
      ),
      const ChatScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: screens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
          boxShadow: [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 10,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex > 4 ? 0 : _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          items: [
            BottomNavigationBarItem(
              icon: const Icon(Icons.home_outlined),
              activeIcon: const Icon(Icons.home_rounded),
              label: lang.t('হোম', 'Home'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.document_scanner_outlined),
              activeIcon: const Icon(Icons.document_scanner_rounded),
              label: lang.t('স্ক্যানার', 'Scanner'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.medication_outlined),
              activeIcon: const Icon(Icons.medication_rounded),
              label: lang.t('ওষুধ', 'Medicines'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.shield_outlined),
              activeIcon: const Icon(Icons.shield_rounded),
              label: lang.t('সেফটি', 'Safety'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.chat_bubble_outline_rounded),
              activeIcon: const Icon(Icons.chat_bubble_rounded),
              label: lang.t('এআই চ্যাট', 'AI Chat'),
            ),
          ],
        ),
      ),
    );
  }
}
