import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';

/// Reusable user avatar supporting Google profile photos, Dicebear avatars,
/// role badges, and graceful fallback to user initials.
class UserAvatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final bool isDoctor;
  final double radius;
  final bool showBadge;
  final Border? border;

  const UserAvatar({
    super.key,
    required this.imageUrl,
    required this.name,
    this.isDoctor = false,
    this.radius = 24,
    this.showBadge = false,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveRadius = radius;
    final initial = name.trim().isNotEmpty ? name.trim()[0].toUpperCase() : 'U';

    Widget avatarContent;

    if (imageUrl != null && imageUrl!.trim().isNotEmpty) {
      // Auto-convert SVG dicebear URLs to PNG so Flutter Image.network renders them natively
      final cleanUrl = imageUrl!
          .trim()
          .replaceAll('/svg?', '/png?')
          .replaceAll('.svg', '.png');

      avatarContent = Image.network(
        cleanUrl,
        width: effectiveRadius * 2,
        height: effectiveRadius * 2,
        fit: BoxFit.cover,
        headers: const {'Accept': 'image/*'},
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Center(
            child: SizedBox(
              width: effectiveRadius,
              height: effectiveRadius,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: isDoctor ? const Color(0xFF2563EB) : AppColors.primary,
                value: loadingProgress.expectedTotalBytes != null
                    ? loadingProgress.cumulativeBytesLoaded /
                        loadingProgress.expectedTotalBytes!
                    : null,
              ),
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) => _buildInitialsFallback(initial),
      );
    } else {
      avatarContent = _buildInitialsFallback(initial);
    }

    final avatarCircle = Container(
      width: effectiveRadius * 2,
      height: effectiveRadius * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: border ??
            Border.all(
              color: isDoctor
                  ? const Color(0xFFBFDBFE)
                  : const Color(0xFFCCFBF1),
              width: 1.5,
            ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D000000),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: ClipOval(child: avatarContent),
    );

    if (!showBadge) return avatarCircle;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        avatarCircle,
        Positioned(
          bottom: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.all(2.5),
            decoration: BoxDecoration(
              color: isDoctor ? const Color(0xFF2563EB) : const Color(0xFF0F766E),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 1.5),
            ),
            child: Icon(
              isDoctor
                  ? Icons.verified_rounded
                  : Icons.check_circle_rounded,
              color: Colors.white,
              size: effectiveRadius * 0.55,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInitialsFallback(String initial) {
    return Container(
      color: isDoctor ? const Color(0xFFEFF6FF) : const Color(0xFFF0FDFA),
      alignment: Alignment.center,
      child: Text(
        initial,
        style: TextStyle(
          fontSize: radius * 0.9,
          fontWeight: FontWeight.bold,
          color: isDoctor ? const Color(0xFF1D4ED8) : const Color(0xFF0F766E),
        ),
      ),
    );
  }
}
