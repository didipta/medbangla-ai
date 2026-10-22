import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../../auth/presentation/pages/profile_page.dart';
import '../../../clinical_chat/presentation/pages/chat_page.dart';
import '../../../drug_interactions/presentation/pages/interaction_page.dart';
import '../../../medicines/presentation/pages/medicines_page.dart';
import '../../../prescription_scanner/presentation/pages/scanner_page.dart';
import 'dashboard_page.dart';

class MainShellPage extends StatefulWidget {
  const MainShellPage({super.key});

  @override
  State<MainShellPage> createState() => _MainShellPageState();
}

class _MainShellPageState extends State<MainShellPage> {
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

    final List<Widget> pages = [
      DashboardPage(onNavigateTab: _navigateToTab),
      ScannerPage(onCheckMedsSafety: _checkSafetyForMeds),
      const MedicinesPage(),
      InteractionPage(
        key: ValueKey(_passedMedicinesForCheck?.join(',') ?? 'default-clean'),
        initialMedicines: _passedMedicinesForCheck,
      ),
      const ChatPage(),
      const ProfilePage(),
    ];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: pages),
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
          type: BottomNavigationBarType.fixed,
          currentIndex: _currentIndex,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textSecondary,
          selectedFontSize: 11,
          unselectedFontSize: 10,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          items: [
            BottomNavigationBarItem(
              icon: const Icon(Icons.home_outlined, size: 20),
              activeIcon: const Icon(Icons.home_rounded, size: 20),
              label: lang.t('হোম', 'Home'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.document_scanner_outlined, size: 20),
              activeIcon: const Icon(Icons.document_scanner_rounded, size: 20),
              label: lang.t('স্ক্যানার', 'Scanner'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.medication_outlined, size: 20),
              activeIcon: const Icon(Icons.medication_rounded, size: 20),
              label: lang.t('ওষুধ', 'Medicines'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.shield_outlined, size: 20),
              activeIcon: const Icon(Icons.shield_rounded, size: 20),
              label: lang.t('সেফটি', 'Safety'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.chat_bubble_outline_rounded, size: 20),
              activeIcon: const Icon(Icons.chat_bubble_rounded, size: 20),
              label: lang.t('চ্যাট', 'Chat'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.person_outline_rounded, size: 20),
              activeIcon: const Icon(Icons.person_rounded, size: 20),
              label: lang.t('প্রোফাইল', 'Profile'),
            ),
          ],
        ),
      ),
    );
  }
}
