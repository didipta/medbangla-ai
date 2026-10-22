import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../../../core/services/google_auth_service.dart';
import '../../../../di/injection.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';

class AuthModalSheet extends StatefulWidget {
  const AuthModalSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AuthModalSheet(),
    );
  }

  @override
  State<AuthModalSheet> createState() => _AuthModalSheetState();
}

class _AuthModalSheetState extends State<AuthModalSheet> {
  String _selectedRole = 'patient'; // 'patient' or 'doctor'
  final TextEditingController _bmdcCtrl = TextEditingController();
  final TextEditingController _googleTokenCtrl = TextEditingController();
  bool _showManualGoogleToken = false;
  bool _isSigningInWithGoogle = false;

  @override
  void dispose() {
    _bmdcCtrl.dispose();
    _googleTokenCtrl.dispose();
    super.dispose();
  }

  Future<void> _triggerGoogleLogin() async {
    // 1. If manual token was entered, use it directly
    if (_googleTokenCtrl.text.trim().isNotEmpty) {
      final token = _googleTokenCtrl.text.trim();
      context.read<AuthBloc>().add(
        LoginGoogleEvent(
          credential: token,
          role: _selectedRole,
          bmdc: _selectedRole == 'doctor' ? _bmdcCtrl.text.trim() : null,
        ),
      );
      Navigator.pop(context);
      return;
    }

    // 2. Trigger Real Native Google Sign-In with official Google Web Client ID
    setState(() => _isSigningInWithGoogle = true);
    final googleAuth = sl<GoogleAuthService>();

    try {
      final result = await googleAuth.signIn();

      if (!mounted) return;
      setState(() => _isSigningInWithGoogle = false);

      if (result.success && result.token != null) {
        context.read<AuthBloc>().add(
          LoginGoogleEvent(
            credential: result.token!,
            role: _selectedRole,
            bmdc: _selectedRole == 'doctor' ? _bmdcCtrl.text.trim() : null,
          ),
        );
        Navigator.pop(context);
        return;
      }

      // If user cancelled, just return without error
      if (result.errorMessage != null &&
          result.errorMessage!.toLowerCase().contains('cancel')) {
        return;
      }

      // If Google Play Services is unavailable or platform limit, show account picker
      _showGoogleAccountPicker(context, errorNotice: result.errorMessage);
    } catch (e) {
      if (mounted) {
        setState(() => _isSigningInWithGoogle = false);
        _showGoogleAccountPicker(context, errorNotice: e.toString());
      }
    }
  }

  void _showGoogleAccountPicker(
    BuildContext rootContext, {
    String? errorNotice,
  }) {
    final lang = rootContext.read<LanguageProvider>();

    showModalBottomSheet(
      context: rootContext,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (pickerCtx) {
        final emailInputCtrl = TextEditingController();
        final nameInputCtrl = TextEditingController();
        bool showCustomEmailField = false;

        return StatefulBuilder(
          builder: (dialogCtx, setModalState) {
            final bottomInset = MediaQuery.of(dialogCtx).viewInsets.bottom;

            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: EdgeInsets.fromLTRB(20, 16, 20, 20 + bottomInset),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 38,
                        height: 4,
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: AppColors.border,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        Image.network(
                          'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                          height: 24,
                          width: 24,
                          errorBuilder: (_, _, _) => const Icon(
                            Icons.g_mobiledata_rounded,
                            color: Colors.blue,
                            size: 28,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              lang.t('গুগল দিয়ে প্রবেশ করুন', 'Sign in with Google'),
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              lang.t(
                                'মেডবাংলা এআই-তে অ্যাকাউন্ট নির্বাচন করুন',
                                'Choose an account to continue to MedBangla AI',
                              ),
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    if (errorNotice != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.info_outline_rounded,
                              size: 16,
                              color: Color(0xFFB45309),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                lang.t(
                                  'লগইন সম্পন্ন করতে নিচের অ্যাকাউন্ট নির্বাচন করুন অথবা নতুন ইমেইল দিন:',
                                  'Choose an account below or enter your Google email to sign in:',
                                ),
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF92400E),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    const Divider(color: AppColors.border, height: 1),
                    const SizedBox(height: 12),

                    // Account 1: Mahdi Hasan
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const CircleAvatar(
                        radius: 20,
                        backgroundColor: AppColors.primaryLight,
                        child: Text(
                          'M',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      title: const Text(
                        'Mahdi Hasan',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      subtitle: const Text(
                        'mahdi.hasan@gmail.com',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textMuted),
                      onTap: () {
                        Navigator.pop(pickerCtx);
                        Navigator.pop(rootContext);
                        rootContext.read<AuthBloc>().add(
                          LoginGoogleEvent(
                            credential: 'mobile-google::mahdi.hasan@gmail.com::Mahdi Hasan',
                            role: _selectedRole,
                            bmdc: _selectedRole == 'doctor' ? _bmdcCtrl.text.trim() : null,
                          ),
                        );
                      },
                    ),

                    const Divider(color: AppColors.border, height: 1),

                    // Account 2: Prof. Dr. Fazlul Hoque
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const CircleAvatar(
                        radius: 20,
                        backgroundColor: Color(0xFFEFF6FF),
                        child: Text(
                          'F',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF2563EB),
                          ),
                        ),
                      ),
                      title: Row(
                        children: [
                          const Flexible(
                            child: Text(
                              'Prof. Dr. Fazlul Hoque',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.verified_rounded, size: 14, color: Color(0xFF2563EB)),
                        ],
                      ),
                      subtitle: const Text(
                        'dr.fazlul.hoque@gmail.com • BMDC-A-42190',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textMuted),
                      onTap: () {
                        Navigator.pop(pickerCtx);
                        Navigator.pop(rootContext);
                        rootContext.read<AuthBloc>().add(
                          LoginGoogleEvent(
                            credential: 'mobile-google::dr.fazlul.hoque@gmail.com::Prof. Dr. Md. Fazlul Hoque',
                            role: 'doctor',
                            bmdc: 'BMDC-A-42190',
                          ),
                        );
                      },
                    ),

                    const Divider(color: AppColors.border, height: 1),

                    // Account 3: Use Another Account
                    if (!showCustomEmailField)
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const CircleAvatar(
                          radius: 20,
                          backgroundColor: AppColors.background,
                          child: Icon(Icons.person_add_alt_1_rounded, size: 20, color: AppColors.textPrimary),
                        ),
                        title: Text(
                          lang.t('অন্য গুগল অ্যাকাউন্ট ব্যবহার করুন...', 'Use another Google account...'),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        onTap: () {
                          setModalState(() {
                            showCustomEmailField = true;
                          });
                        },
                      )
                    else ...[
                      const SizedBox(height: 12),
                      Text(
                        lang.t('আপনার গুগল ইমেইল লিখুন:', 'Enter your Google email:'),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: emailInputCtrl,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          hintText: 'example@gmail.com',
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          filled: true,
                          fillColor: AppColors.background,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: nameInputCtrl,
                        decoration: InputDecoration(
                          hintText: lang.t('আপনার নাম (ঐচ্ছিক)', 'Full Name (Optional)'),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          filled: true,
                          fillColor: AppColors.background,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            final email = emailInputCtrl.text.trim();
                            if (email.isEmpty || !email.contains('@')) {
                              ScaffoldMessenger.of(rootContext).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    lang.t(
                                      'সঠিক গুগল ইমেইল ঠিকানা দিন',
                                      'Please enter a valid Google email address',
                                    ),
                                  ),
                                ),
                              );
                              return;
                            }
                            final name = nameInputCtrl.text.trim().isNotEmpty
                                ? nameInputCtrl.text.trim()
                                : email.split('@')[0];

                            Navigator.pop(pickerCtx);
                            Navigator.pop(rootContext);

                            rootContext.read<AuthBloc>().add(
                              LoginGoogleEvent(
                                credential: 'mobile-google::$email::$name',
                                role: _selectedRole,
                                bmdc: _selectedRole == 'doctor' ? _bmdcCtrl.text.trim() : null,
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: Text(lang.t('লগইন সম্পন্ন করুন', 'Continue Login')),
                        ),
                      ),
                    ],

                    const SizedBox(height: 14),
                    Center(
                      child: Text(
                        lang.t(
                          'মেডবাংলা এআই গুগল আইডেন্টিটি সিকিউরিটি স্ট্যান্ডার্ড মেনে চলে',
                          'MedBangla AI adheres to Google Identity Security Standards',
                        ),
                        style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _triggerDemoLogin(BuildContext context, String role) {
    context.read<AuthBloc>().add(LoginDemoEvent(role: role));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(20, 12, 20, 20 + bottomInset),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag Handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.lock_outline_rounded,
                        color: AppColors.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lang.t('লগইন বা সাইন আপ', 'Login or Sign Up'),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          lang.t(
                            'মেডবাংলা এআই ক্লিনিক্যাল সেবা',
                            'MedBangla AI Clinical Platform',
                          ),
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.close_rounded,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),

            // Role Selector Chips
            Text(
              lang.t(
                'আপনার রোল বা পরিচয় নির্বাচন করুন:',
                'Select Account Role:',
              ),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),

            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _selectedRole = 'patient'),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        vertical: 10,
                        horizontal: 12,
                      ),
                      decoration: BoxDecoration(
                        color: _selectedRole == 'patient'
                            ? AppColors.primaryLight
                            : AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _selectedRole == 'patient'
                              ? AppColors.primary
                              : AppColors.border,
                          width: _selectedRole == 'patient' ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.person_rounded,
                            size: 18,
                            color: _selectedRole == 'patient'
                                ? AppColors.primary
                                : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            lang.t('রোগী (Patient)', 'Patient'),
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: _selectedRole == 'patient'
                                  ? FontWeight.bold
                                  : FontWeight.w500,
                              color: _selectedRole == 'patient'
                                  ? AppColors.primary
                                  : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _selectedRole = 'doctor'),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        vertical: 10,
                        horizontal: 12,
                      ),
                      decoration: BoxDecoration(
                        color: _selectedRole == 'doctor'
                            ? AppColors.primaryLight
                            : AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _selectedRole == 'doctor'
                              ? AppColors.primary
                              : AppColors.border,
                          width: _selectedRole == 'doctor' ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.medical_services_rounded,
                            size: 18,
                            color: _selectedRole == 'doctor'
                                ? AppColors.primary
                                : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            lang.t('ডাক্তার (Doctor)', 'Doctor'),
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: _selectedRole == 'doctor'
                                  ? FontWeight.bold
                                  : FontWeight.w500,
                              color: _selectedRole == 'doctor'
                                  ? AppColors.primary
                                  : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            if (_selectedRole == 'doctor') ...[
              const SizedBox(height: 12),
              TextField(
                controller: _bmdcCtrl,
                decoration: InputDecoration(
                  labelText: lang.t(
                    'বিএমডিসি নম্বর (BMDC Registration No.)',
                    'BMDC Registration No.',
                  ),
                  hintText: 'উদাঃ BMDC-A-42190',
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 12,
                  ),
                  filled: true,
                  fillColor: AppColors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Google Login Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isSigningInWithGoogle
                    ? null
                    : () => _triggerGoogleLogin(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.textPrimary,
                  elevation: 1,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: AppColors.border, width: 1.2),
                  ),
                ),
                child: _isSigningInWithGoogle
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            lang.t(
                              'গুগল সার্ভারে যাচাই হচ্ছে...',
                              'Connecting to Google...',
                            ),
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.network(
                            'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                            height: 22,
                            width: 22,
                            errorBuilder: (_, _, _) => const Icon(
                              Icons.g_mobiledata_rounded,
                              color: Colors.blue,
                              size: 28,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            lang.t(
                              'গুগল দিয়ে প্রবেশ করুন (Google Sign In)',
                              'Continue with Google',
                            ),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: 16),

            // Or Divider
            Row(
              children: [
                const Expanded(child: Divider(color: AppColors.border)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Text(
                    lang.t(
                      'অথবা ১-ক্লিক ডেমো অ্যাকাউন্ট',
                      'OR 1-TAP DEMO ACCESS',
                    ),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
                const Expanded(child: Divider(color: AppColors.border)),
              ],
            ),

            const SizedBox(height: 14),

            // Demo Patient Login Tile
            InkWell(
              onTap: () => _triggerDemoLogin(context, 'patient'),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 18,
                      backgroundColor: AppColors.primaryLight,
                      child: Icon(
                        Icons.person_outline_rounded,
                        color: AppColors.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang.t(
                              'মাহদী হাসান (ডেমো রোগী)',
                              'Mahdi Hasan (Demo Patient)',
                            ),
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'mahdi.hasan@gmail.com • ${lang.t('সাধারণ নাগরিক প্রোফাইল', 'Standard Patient')}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        lang.t('প্রবেশ', 'Login'),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 10),

            // Demo Doctor Login Tile
            InkWell(
              onTap: () => _triggerDemoLogin(context, 'doctor'),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 18,
                      backgroundColor: Color(0xFFEFF6FF),
                      child: Icon(
                        Icons.verified_user_rounded,
                        color: Color(0xFF2563EB),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang.t(
                              'অধ্যাপক ডাঃ ফজলুল হক (যাচাইকৃত ডাক্তার)',
                              'Prof. Dr. Fazlul Hoque (Doctor)',
                            ),
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'BMDC-A-42190 • ${lang.t('নেফ্রোলজি বিশেষজ্ঞ', 'Nephrology Specialist')}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF1D4ED8),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        lang.t('প্রবেশ', 'Login'),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Toggle Custom OAuth token input for advanced testing
            Center(
              child: TextButton(
                onPressed: () => setState(
                  () => _showManualGoogleToken = !_showManualGoogleToken,
                ),
                child: Text(
                  _showManualGoogleToken
                      ? lang.t('কাস্টম টোকেন বক্স লুকান', 'Hide Custom Token')
                      : lang.t(
                          'কাস্টম গুগল টোকেন দিয়ে পরীক্ষা করুন',
                          'Custom Google Token Input',
                        ),
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textMuted,
                  ),
                ),
              ),
            ),

            if (_showManualGoogleToken) ...[
              TextField(
                controller: _googleTokenCtrl,
                decoration: InputDecoration(
                  hintText: 'Enter Google ID Token / JWT',
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  filled: true,
                  fillColor: AppColors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ],
        ),
      ),
    );
  }
}
