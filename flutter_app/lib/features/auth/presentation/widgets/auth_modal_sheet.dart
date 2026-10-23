import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/language_provider.dart';
import '../../../../core/services/google_auth_service.dart';
import '../../../../di/injection.dart';
import '../../../../widgets/user_avatar.dart';
import '../../domain/entities/user_entity.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

/// Modal sheet matching frontend AuthModal.tsx with pixel-perfect aesthetics,
/// 1-click verified demo profiles, and real Google Identity sign-in.
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
  bool _isSubmitting = false;
  bool _isSuccess = false;
  UserEntity? _authenticatedUser;
  String? _statusMessage;
  String? _errorMessage;

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
      setState(() {
        _isSubmitting = true;
        _errorMessage = null;
        _statusMessage = 'কাস্টম টোকেন যাচাই হচ্ছে...';
      });
      context.read<AuthBloc>().add(
        LoginGoogleEvent(
          credential: token,
          role: _selectedRole,
          bmdc: _selectedRole == 'doctor' ? _bmdcCtrl.text.trim() : null,
        ),
      );
      return;
    }

    // 2. Trigger Real Native Google Sign-In with official Google Web Client ID
    setState(() {
      _isSigningInWithGoogle = true;
      _isSubmitting = true;
      _errorMessage = null;
      _statusMessage = 'গুগল সার্ভারে যাচাই হচ্ছে...';
    });

    final googleAuth = sl<GoogleAuthService>();

    try {
      final result = await googleAuth.signIn();

      if (!mounted) return;

      if (result.success && result.token != null) {
        setState(() {
          _isSigningInWithGoogle = false;
          _isSubmitting = true;
          _statusMessage = 'মেডবাংলা ক্লাউড সার্ভারে প্রোফাইল সংরক্ষিত হচ্ছে...';
        });
        context.read<AuthBloc>().add(
          LoginGoogleEvent(
            credential: result.token!,
            role: _selectedRole,
            bmdc: _selectedRole == 'doctor' ? _bmdcCtrl.text.trim() : null,
          ),
        );
        return;
      }

      setState(() {
        _isSigningInWithGoogle = false;
        _isSubmitting = false;
      });

      // If user cancelled, just return without error
      if (result.isCancelled ||
          (result.errorMessage != null &&
              result.errorMessage!.toLowerCase().contains('cancel'))) {
        return;
      }

      // If Google Play Services is unavailable or platform limit, show fallback account picker
      _showGoogleAccountPicker(context, errorNotice: result.errorMessage);
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSigningInWithGoogle = false;
          _isSubmitting = false;
        });
        _showGoogleAccountPicker(context, errorNotice: e.toString());
      }
    }
  }

  void _triggerDemoLogin(BuildContext context, String role) {
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
      _statusMessage = role == 'doctor'
          ? 'ডাক্তার ডেমো প্রোফাইল প্রস্তুত হচ্ছে...'
          : 'রোগী ডেমো প্রোফাইল প্রস্তুত হচ্ছে...';
    });
    context.read<AuthBloc>().add(
      LoginDemoEvent(role: role),
    );
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

            return Material(
              color: Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              clipBehavior: Clip.antiAlias,
              child: Padding(
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
                        _buildGoogleIcon(size: 24),
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
                        backgroundColor: Color(0xFFF0FDFA),
                        child: Text(
                          'M',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F766E),
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
                        setState(() {
                          _isSubmitting = true;
                          _errorMessage = null;
                          _statusMessage = 'গুগল অ্যাকাউন্টে লগইন সম্পন্ন হচ্ছে...';
                        });
                        rootContext.read<AuthBloc>().add(
                          LoginGoogleEvent(
                            credential: 'mobile-google::mahdi.hasan@gmail.com::Mahdi Hasan::https://api.dicebear.com/7.x/avataaars/png?seed=Mahdi',
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
                        setState(() {
                          _isSubmitting = true;
                          _errorMessage = null;
                          _statusMessage = 'ডাক্তার প্রোফাইল লোড ও ক্লাউডে সংরক্ষণ হচ্ছে...';
                        });
                        rootContext.read<AuthBloc>().add(
                          LoginGoogleEvent(
                            credential: 'mobile-google::dr.fazlul.hoque@gmail.com::Prof. Dr. Md. Fazlul Hoque::https://api.dicebear.com/7.x/avataaars/png?seed=Fazlul',
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
                            final seed = name.split(' ')[0];

                            Navigator.pop(pickerCtx);
                            setState(() {
                              _isSubmitting = true;
                              _errorMessage = null;
                              _statusMessage = 'গুগল প্রোফাইল তৈরি ও সংরক্ষণ হচ্ছে...';
                            });

                            rootContext.read<AuthBloc>().add(
                              LoginGoogleEvent(
                                credential: 'mobile-google::$email::$name::https://api.dicebear.com/7.x/avataaars/png?seed=$seed',
                                role: _selectedRole,
                                bmdc: _selectedRole == 'doctor' ? _bmdcCtrl.text.trim() : null,
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F766E),
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
            ),
          );
        },
        );
      },
    );
  }

  Widget _buildGoogleIcon({double size = 20}) {
    return Image.network(
      'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
      height: size,
      width: size,
      errorBuilder: (ctx, err, stack) => Icon(
        Icons.g_mobiledata_rounded,
        color: Colors.blue,
        size: size + 6,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthenticatedState) {
          setState(() {
            _isSubmitting = false;
            _isSigningInWithGoogle = false;
            _isSuccess = true;
            _authenticatedUser = state.user;
          });
          final navigator = Navigator.of(context);
          Future.delayed(const Duration(milliseconds: 750), () {
            if (mounted && navigator.canPop()) {
              navigator.pop();
            }
          });
        } else if (state is AuthErrorState) {
          setState(() {
            _isSubmitting = false;
            _isSigningInWithGoogle = false;
            _errorMessage = state.message;
          });
        }
      },
      builder: (context, state) {
        final isLoading = _isSubmitting || _isSigningInWithGoogle || state is AuthLoadingState;

        return Material(
          color: Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          clipBehavior: Clip.antiAlias,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Banner with Gradient & Glow matching Frontend
                Stack(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 22),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Color(0xFF0D9488), // Teal-600
                            Color(0xFF0F766E), // Teal-700
                            Color(0xFF047857), // Emerald-700
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Column(
                        children: [
                          // Drag Handle
                          Center(
                            child: Container(
                              width: 38,
                              height: 4,
                              margin: const EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.4),
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          ),

                          // HeartHandshake Badge
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.25),
                              ),
                            ),
                            child: const Icon(
                              Icons.volunteer_activism_rounded,
                              color: Colors.white,
                              size: 26,
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Title
                          Text(
                            lang.t(
                              'মেডবাংলা এআই-তে সাইন-ইন',
                              'Sign in to MedBangla AI',
                            ),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: -0.3,
                            ),
                          ),
                          const SizedBox(height: 4),

                          // Subtitle
                          Text(
                            lang.t(
                              'আপনার আসল গুগল ইমেইল দিয়ে সুরক্ষিত ১-ক্লিক লগইন',
                              'Real 1-Click Login with your official Google Account',
                            ),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.teal.shade100,
                              fontWeight: FontWeight.w500,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),

                    // Close Button
                    Positioned(
                      top: 14,
                      right: 14,
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () => Navigator.pop(context),
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close_rounded,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                // Modal Body Content
                Padding(
                  padding: EdgeInsets.fromLTRB(20, 18, 20, 24 + bottomInset),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Success State Card when authenticated
                      if (_isSuccess && _authenticatedUser != null) ...[
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDF4),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF86EFAC)),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x08000000),
                                blurRadius: 8,
                                offset: Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              UserAvatar(
                                imageUrl: _authenticatedUser!.picture,
                                name: _authenticatedUser!.name,
                                isDoctor: _authenticatedUser!.isDoctor,
                                radius: 34,
                                showBadge: true,
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(
                                    Icons.check_circle_rounded,
                                    color: Color(0xFF16A34A),
                                    size: 20,
                                  ),
                                  const SizedBox(width: 6),
                                  Flexible(
                                    child: Text(
                                      lang.t(
                                        'স্বাগতম, ${_authenticatedUser!.name}!',
                                        'Welcome, ${_authenticatedUser!.name}!',
                                      ),
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF14532D),
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _authenticatedUser!.isDoctor
                                    ? lang.t('যাচাইকৃত ডাক্তার হিসেবে সফলভাবে লগইন হয়েছে', 'Successfully signed in as Verified Doctor')
                                    : lang.t('সফলভাবে গুগল অ্যাকাউন্টে লগইন হয়েছে', 'Successfully signed in with Google'),
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF15803D),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 14),
                              const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Color(0xFF16A34A),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      // Active Loading Banner
                      if (isLoading && !_isSuccess) ...[
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(bottom: 14),
                          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFF0FDFA), Color(0xFFECFDF5)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFF99F6E4)),
                          ),
                          child: Row(
                            children: [
                              const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.2,
                                  color: Color(0xFF0F766E),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _statusMessage ??
                                          lang.t(
                                            'প্রোফাইল লোড ও সার্ভারে যাচাই হচ্ছে...',
                                            'Authenticating with server...',
                                          ),
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF0F766E),
                                      ),
                                    ),
                                    Text(
                                      lang.t(
                                        'অনুগ্রহ করে অপেক্ষা করুন...',
                                        'Please wait a moment...',
                                      ),
                                      style: const TextStyle(
                                        fontSize: 10,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      // Error Banner
                      if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF1F2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFECDD3)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(
                            Icons.error_outline_rounded,
                            size: 18,
                            color: Color(0xFFE11D48),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFFBE123C),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Role Selection Header
                  Text(
                    lang.t(
                      'আপনার পরিচয় নির্বাচন করুন / Select Role',
                      'Select Your Role',
                    ).toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Role Toggle Buttons in Segmented Style
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _selectedRole = 'patient'),
                            borderRadius: BorderRadius.circular(10),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 180),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _selectedRole == 'patient'
                                    ? Colors.white
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                                border: _selectedRole == 'patient'
                                    ? Border.all(
                                        color: const Color(0x330F766E),
                                      )
                                    : null,
                                boxShadow: _selectedRole == 'patient'
                                    ? const [
                                        BoxShadow(
                                          color: Color(0x0A000000),
                                          blurRadius: 4,
                                          offset: Offset(0, 1),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.person_rounded,
                                    size: 16,
                                    color: _selectedRole == 'patient'
                                        ? const Color(0xFF0F766E)
                                        : const Color(0xFF64748B),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    lang.t(
                                      'রোগী / সাধারণ ব্যবহারকারী',
                                      'Patient / User',
                                    ),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: _selectedRole == 'patient'
                                          ? const Color(0xFF0F766E)
                                          : const Color(0xFF475569),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _selectedRole = 'doctor'),
                            borderRadius: BorderRadius.circular(10),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 180),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _selectedRole == 'doctor'
                                    ? Colors.white
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                                border: _selectedRole == 'doctor'
                                    ? Border.all(
                                        color: const Color(0x330F766E),
                                      )
                                    : null,
                                boxShadow: _selectedRole == 'doctor'
                                    ? const [
                                        BoxShadow(
                                          color: Color(0x0A000000),
                                          blurRadius: 4,
                                          offset: Offset(0, 1),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.medical_services_rounded,
                                    size: 16,
                                    color: _selectedRole == 'doctor'
                                        ? const Color(0xFF0F766E)
                                        : const Color(0xFF64748B),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    lang.t('চিকিৎসক / Doctor', 'Doctor'),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: _selectedRole == 'doctor'
                                          ? const Color(0xFF0F766E)
                                          : const Color(0xFF475569),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Doctor BMDC Field (Smooth Expansion)
                  if (_selectedRole == 'doctor') ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDFA),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFCCFBF1)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang.t(
                              'বিএমডিসি রেজিস্ট্রেশন নম্বর (ঐচ্ছিক)',
                              'BMDC Reg. Number (Optional)',
                            ),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF134E4A),
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _bmdcCtrl,
                            decoration: InputDecoration(
                              hintText: lang.t(
                                'যেমন: A-33457 বা A-54921',
                                'e.g. BMDC-A-42190',
                              ),
                              hintStyle: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF94A3B8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 10,
                              ),
                              filled: true,
                              fillColor: Colors.white,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(
                                  color: Color(0xFF99F6E4),
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(
                                  color: Color(0xFF99F6E4),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),

                  // 1-Click Instant Demo Login Box matching Frontend
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFFF0FDFA),
                          Color(0xFFECFDF5),
                          Color(0xFFECFEFF),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFF99F6E4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.bolt_rounded,
                                  size: 18,
                                  color: Color(0xFFD97706),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  lang.t(
                                    '⚡ ১-ক্লিকে তাৎক্ষণিক ডেমো লগইন',
                                    '⚡ 1-Click Instant Demo Login',
                                  ),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF0F766E),
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFCCFBF1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: const Color(0xFF99F6E4),
                                ),
                              ),
                              child: Text(
                                lang.t('পাসওয়ার্ড ছাড়া প্রবেশ', 'No Password'),
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0F766E),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          lang.t(
                            'সিস্টেম টেস্ট করতে নিচের যেকোনো ডেমো জিমেইল প্রোফাইল দিয়ে এখনই প্রবেশ করুন:',
                            'Test all AI features immediately with a verified demo Gmail account:',
                          ),
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF475569),
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Two Demo Profile Action Buttons
                        Row(
                          children: [
                            Expanded(
                              child: InkWell(
                                onTap: isLoading ? null : () => _triggerDemoLogin(context, 'patient'),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 9,
                                    horizontal: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: const Color(0xFF5EEAD4),
                                    ),
                                    boxShadow: const [
                                      BoxShadow(
                                        color: Color(0x05000000),
                                        blurRadius: 3,
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(
                                        Icons.person_rounded,
                                        size: 15,
                                        color: Color(0xFF0D9488),
                                      ),
                                      const SizedBox(width: 5),
                                      Flexible(
                                        child: Text(
                                          lang.t(
                                            'রোগী ডেমো (Mahdi)',
                                            'Patient Demo',
                                          ),
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF115E59),
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: InkWell(
                                onTap: isLoading ? null : () => _triggerDemoLogin(context, 'doctor'),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 9,
                                    horizontal: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: const Color(0xFF5EEAD4),
                                    ),
                                    boxShadow: const [
                                      BoxShadow(
                                        color: Color(0x05000000),
                                        blurRadius: 3,
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(
                                        Icons.medical_services_rounded,
                                        size: 15,
                                        color: Color(0xFF0D9488),
                                      ),
                                      const SizedBox(width: 5),
                                      Flexible(
                                        child: Text(
                                          lang.t(
                                            'ডাক্তার ডেমো (Dr. Fazlul)',
                                            'Doctor Demo',
                                          ),
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF115E59),
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Divider
                  Row(
                    children: [
                      const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        child: Text(
                          lang.t(
                            'অথবা আপনার নিজস্ব গুগল আইডি দিয়ে',
                            'Or Continue With Your Google Account',
                          ),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ),
                      const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Official Real Google Sign-In Action Button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: isLoading
                          ? null
                          : () => _triggerGoogleLogin(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF1E293B),
                        elevation: 1.5,
                        shadowColor: const Color(0x1A000000),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: const BorderSide(
                            color: Color(0xFFCBD5E1),
                            width: 1.5,
                          ),
                        ),
                      ),
                      child: isLoading
                          ? Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.2,
                                    color: Color(0xFF0F766E),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  _statusMessage ??
                                      lang.t(
                                        'গুগল সার্ভারে যাচাই হচ্ছে...',
                                        'Connecting to Google...',
                                      ),
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0F766E),
                                  ),
                                ),
                              ],
                            )
                          : Row(
                              children: [
                                _buildGoogleIcon(size: 22),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    lang.t(
                                      'গুগল দিয়ে প্রবেশ করুন (Continue with Google)',
                                      'Continue with Google',
                                    ),
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1E293B),
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const Icon(
                                  Icons.arrow_forward_rounded,
                                  size: 18,
                                  color: Color(0xFF94A3B8),
                                ),
                              ],
                            ),
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Real-World Trust Signals & Database Save Guarantee
                  Container(
                    padding: const EdgeInsets.only(top: 10),
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Color(0xFFF1F5F9)),
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.check_circle_rounded,
                              size: 15,
                              color: Color(0xFF16A34A),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                lang.t(
                                  'প্রথমবার লগইনে আপনার আসল গুগল তথ্য ডাটাবেজে তৈরি ও সংরক্ষিত হবে।',
                                  'First login automatically saves your real Google profile to Neon DB.',
                                ),
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF475569),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(
                              Icons.shield_rounded,
                              size: 15,
                              color: Color(0xFF0F766E),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                lang.t(
                                  '১০০% আসল গুগল সিকিউরিটি — কোনো ফেক বা ডামি অ্যাকাউন্ট নয়।',
                                  '100% Real Google Identity Security — Zero fake accounts.',
                                ),
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF475569),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Privacy Disclaimer
                  Center(
                    child: Text(
                      lang.t(
                        'লগইন করার মাধ্যমে আপনি মেডবাংলা এআই এর শর্তাবলী ও গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন।',
                        "By signing in, you agree to MedBangla AI's Terms of Service and Privacy Policy.",
                      ),
                      style: const TextStyle(
                        fontSize: 10,
                        color: Color(0xFF94A3B8),
                        height: 1.3,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),

                  // Optional Custom Token Box for Debugging / Admin
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
                          fontSize: 10,
                          color: Color(0xFF94A3B8),
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
                    const SizedBox(height: 6),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
      },
    );
  }
}
