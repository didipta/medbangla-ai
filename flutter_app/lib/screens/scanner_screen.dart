import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/localization/language_provider.dart';
import '../models/prescription_model.dart';
import '../services/auth_service.dart';
import '../services/ocr_service.dart';
import '../widgets/prescription_result_card.dart';

class ScannerScreen extends StatefulWidget {
  final Function(List<String>) onCheckMedsSafety;

  const ScannerScreen({super.key, required this.onCheckMedsSafety});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final OcrService _ocrService = OcrService();
  final ImagePicker _picker = ImagePicker();

  PrescriptionScanResult? _scanResult;
  bool _isScanning = false;
  String? _selectedImagePath;

  @override
  void initState() {
    super.initState();
    // Pre-populate with Preset 1 for immediate live preview
    _scanResult = OcrService.demoPresets[0];
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1600,
        maxHeight: 2000,
        imageQuality: 88,
      );

      if (file != null) {
        setState(() {
          _isScanning = true;
          _selectedImagePath = file.path;
        });

        if (!mounted) return;
        final auth = Provider.of<AuthService>(context, listen: false);
        final result = await _ocrService.scanPrescriptionFile(
          file.path,
          token: auth.token,
        );

        if (!mounted) return;
        setState(() {
          _scanResult = result;
          _isScanning = false;
        });
      }
    } catch (e) {
      setState(() => _isScanning = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error selecting image: $e')));
      }
    }
  }

  void _loadPreset(int index) {
    setState(() {
      _selectedImagePath = null;
      _scanResult = OcrService.demoPresets[index];
    });
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          lang.t('প্রেসক্রিপশন স্ক্যানার', 'Prescription OCR Scanner'),
        ),
        actions: [
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    lang.t(
                      'রেপিডওসিআর (ONNX) ইঞ্জিন সক্রিয়। ঝাপসা বা কাটা লেখা স্বয়ংক্রিয়ভাবে ফিল্টার হয়।',
                      'RapidOCR (ONNX) engine active with automatic text deskewing.',
                    ),
                  ),
                  duration: const Duration(seconds: 3),
                ),
              );
            },
            icon: const Icon(Icons.help_outline_rounded),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header Card with Camera & Gallery Pickers
          _buildActionPanel(context, lang),
          const SizedBox(height: 16),

          // Preset Selector Chips
          _buildPresetSelector(context, lang),
          const SizedBox(height: 16),

          // Scanner Loading or Scan Result
          if (_selectedImagePath != null)
            Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.primarySurface),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.image_outlined,
                    size: 18,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      lang.t(
                        'কাস্টম প্রেসক্রিপশন ইমেজ লোড করা হয়েছে',
                        'Custom prescription image loaded',
                      ),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          if (_isScanning)
            _buildLoadingIndicator(lang)
          else if (_scanResult != null)
            PrescriptionResultCard(
              result: _scanResult!,
              onCheckInteractions: () {
                final meds = _scanResult!.medicines
                    .map((m) => m.matchedBrand)
                    .toList();
                widget.onCheckMedsSafety(meds);
              },
            ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildActionPanel(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
                  Icons.document_scanner_rounded,
                  color: AppColors.primary,
                  size: 22,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang.t(
                        'নতুন প্রেসক্রিপশন ইনপুট দিন',
                        'Input Prescription Document',
                      ),
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      lang.t(
                        'ক্যামেরা দিয়ে ছবি তুলুন অথবা গ্যালারি থেকে সিলেক্ট করুন',
                        'Capture photo or pick from image gallery',
                      ),
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _pickImage(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt_rounded, size: 18),
                  label: Text(lang.t('ক্যামেরা', 'Camera')),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _pickImage(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_rounded, size: 18),
                  label: Text(lang.t('গ্যালারি', 'Gallery')),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPresetSelector(BuildContext context, LanguageProvider lang) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              lang.t(
                'অথবা নমুনা প্রেসক্রিপশন দেখুন (Demo Presets):',
                'Or View Sample Demo Presets:',
              ),
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildPresetButton(
                title: lang.t(
                  'নমুনা ১: গ্যাস্ট্রাইটিস ও প্রেশার',
                  'Preset 1: Gastritis Rx',
                ),
                subtitle: 'Napa 500 + Seclo 20',
                isSelected: _scanResult?.id == 'preset-01',
                onTap: () => _loadPreset(0),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildPresetButton(
                title: lang.t(
                  'নমুনা ২: পেডিয়াট্রিক ইনফেকশন',
                  'Preset 2: Pediatric Rx',
                ),
                subtitle: 'Ciprocin + Tofen',
                isSelected: _scanResult?.id == 'preset-02',
                onTap: () => _loadPreset(1),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPresetButton({
    required String title,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryLight : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.6 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.bold,
                color: isSelected
                    ? AppColors.primaryDark
                    : AppColors.textPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 10.5,
                color: isSelected ? AppColors.primary : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingIndicator(LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          const CircularProgressIndicator(color: AppColors.primary),
          const SizedBox(height: 16),
          Text(
            lang.t(
              'প্রেসক্রিপশন এআই প্রক্রিয়াকরণ চলছে...',
              'AI Parsing Prescription Document...',
            ),
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            lang.t(
              'হাতের লেখা শনাক্তকরণ ও ডিজিডিএ ডাটাবেজ ম্যাপিং',
              'Handwriting recognition & DGDA database lookup',
            ),
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}
