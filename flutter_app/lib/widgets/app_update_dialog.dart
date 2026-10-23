import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/constants/app_colors.dart';
import '../services/app_control_service.dart';

class AppUpdateDialog extends StatelessWidget {
  final AppLifecycleStatus status;
  final VoidCallback? onDismiss;

  const AppUpdateDialog({
    super.key,
    required this.status,
    this.onDismiss,
  });

  static Future<void> show(
    BuildContext context, {
    required AppLifecycleStatus status,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: !status.isForceUpdate,
      builder: (context) => AppUpdateDialog(status: status),
    );
  }

  Future<void> _launchDownload(BuildContext context, {String? customUrl}) async {
    final targetUrl = customUrl ??
        (status.downloadUrl.isNotEmpty
            ? status.downloadUrl
            : status.googleDriveUrl);

    if (targetUrl.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('ডাউনলোড লিঙ্ক পাওয়া যায়নি। অনুগ্রহ করে সাপোর্ট টিমে যোগাযোগ করুন।'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    final uri = Uri.parse(targetUrl);
    bool opened = false;

    try {
      opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}

    if (!opened) {
      try {
        opened = await launchUrl(uri, mode: LaunchMode.platformDefault);
      } catch (_) {}
    }

    // Secondary fallback: if direct link failed, try Google Drive view URL
    if (!opened && status.googleDriveUrl.isNotEmpty && targetUrl != status.googleDriveUrl) {
      try {
        opened = await launchUrl(
          Uri.parse(status.googleDriveUrl),
          mode: LaunchMode.externalApplication,
        );
      } catch (_) {}
    }

    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('ব্রাউজারে লিঙ্কটি খুলতে ব্যর্থ হয়েছে:\n$targetUrl'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 5),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !status.isForceUpdate,
      child: Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.symmetric(horizontal: 22, vertical: 24),
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header Icon
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: status.isForceUpdate
                      ? const Color(0xFFFEF3C7)
                      : AppColors.primaryLight,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: status.isForceUpdate
                        ? const Color(0xFFFDE68A)
                        : AppColors.primary.withValues(alpha: 0.2),
                    width: 2,
                  ),
                ),
                child: Center(
                  child: Icon(
                    Icons.system_update_rounded,
                    size: 36,
                    color: status.isForceUpdate
                        ? const Color(0xFFD97706)
                        : AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Version & Size Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: status.isForceUpdate
                      ? const Color(0xFFFFFBEB)
                      : const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: status.isForceUpdate
                        ? const Color(0xFFFCD34D)
                        : const Color(0xFF99F6E4),
                  ),
                ),
                child: Text(
                  status.isForceUpdate
                      ? 'বাধ্যতামূলক আপডেট v${status.latestVersion} • ${status.fileSize}'
                      : 'নতুন সংস্করণ v${status.latestVersion} • ${status.fileSize}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: status.isForceUpdate
                        ? const Color(0xFF92400E)
                        : AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Title
              Text(
                status.updateTitle,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 12),

              // Release Notes Container
              if (status.updateNotes.isNotEmpty) ...[
                Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(maxHeight: 140),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'নতুন কী যুক্ত হয়েছে:',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          status.updateNotes,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Action Buttons
              Row(
                children: [
                  if (!status.isForceUpdate) ...[
                    Expanded(
                      child: SizedBox(
                        height: 48,
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                            onDismiss?.call();
                          },
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.border),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: const Text(
                            'পরে করুন',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                  ],
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: ElevatedButton.icon(
                        onPressed: () => _launchDownload(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: status.isForceUpdate
                              ? const Color(0xFFD97706)
                              : AppColors.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        icon: const Icon(Icons.download_rounded, size: 18),
                        label: Text(
                          status.isForceUpdate ? 'এখনই আপডেট' : 'ডাউনলোড করুন',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              if (status.googleDriveUrl.isNotEmpty &&
                  status.googleDriveUrl != status.downloadUrl) ...[
                const SizedBox(height: 10),
                TextButton.icon(
                  onPressed: () => _launchDownload(
                    context,
                    customUrl: status.googleDriveUrl,
                  ),
                  icon: const Icon(Icons.open_in_browser_rounded, size: 16),
                  label: const Text(
                    'গুগল ড্রাইভে খুলুন / বিকল্প লিঙ্ক',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],

              if (status.isForceUpdate) ...[
                const SizedBox(height: 8),
                const Text(
                  '* অ্যাপ ব্যবহার চালিয়ে যেতে সংস্করণটি আপডেট করা আবশ্যক',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFDC2626),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
