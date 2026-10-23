import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';

/// Renders AI and user chat response texts with rich clinical formatting:
/// - Transforms ***bold italic*** and **bold** markdown into clean bold/styled typography.
/// - Transforms standalone *** or --- into clean horizontal divider lines.
/// - Formats markdown headings (###) and bullet/numbered lists cleanly.
/// - Strips out any stray or unclosed *** or ** tags so raw asterisk tags never show.
class FormattedChatText extends StatelessWidget {
  final String text;
  final bool isUser;
  final TextStyle? baseStyle;

  const FormattedChatText({
    super.key,
    required this.text,
    this.isUser = false,
    this.baseStyle,
  });

  @override
  Widget build(BuildContext context) {
    if (text.trim().isEmpty) return const SizedBox.shrink();

    final defaultStyle = baseStyle ??
        TextStyle(
          fontSize: 13.5,
          color: isUser ? Colors.white : AppColors.textPrimary,
          height: 1.45,
        );

    final lines = text.split('\n');

    return Column(
      crossAxisAlignment:
          isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: lines.map((line) {
        final trimmed = line.trim();

        // 1. Empty spacer line
        if (trimmed.isEmpty) {
          return const SizedBox(height: 4);
        }

        // 2. Horizontal divider line: *** or --- or ___
        final dividerRegex = RegExp(r'^(\*{3,}|-{3,}|_{3,})$');
        if (dividerRegex.hasMatch(trimmed)) {
          return Container(
            margin: const EdgeInsets.symmetric(vertical: 6),
            height: 1,
            color: isUser
                ? Colors.white.withValues(alpha: 0.3)
                : AppColors.border,
          );
        }

        // 3. Headings: ### Header or ## Header or # Header
        final headingRegex = RegExp(r'^#{1,4}\s+(.+)$');
        final headingMatch = headingRegex.firstMatch(trimmed);
        if (headingMatch != null) {
          final headingText = headingMatch.group(1)!;
          return Padding(
            padding: const EdgeInsets.only(top: 4, bottom: 2),
            child: RichText(
              text: TextSpan(
                style: defaultStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: defaultStyle.fontSize != null
                      ? defaultStyle.fontSize! * 1.08
                      : 14.5,
                  color: isUser ? Colors.white : AppColors.primaryDark,
                ),
                children: _parseInlineSpans(headingText, defaultStyle, isHeading: true),
              ),
            ),
          );
        }

        // 4. Bullet list items: * Item, - Item, • Item
        final bulletRegex = RegExp(r'^[\*\-•]\s+(.+)$');
        final bulletMatch = bulletRegex.firstMatch(trimmed);
        if (bulletMatch != null) {
          final bulletText = bulletMatch.group(1)!;
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 1.5),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 6, top: 1),
                  child: Text(
                    '•',
                    style: TextStyle(
                      fontSize: (defaultStyle.fontSize ?? 13.5) * 1.1,
                      fontWeight: FontWeight.bold,
                      color: isUser
                          ? Colors.white.withValues(alpha: 0.85)
                          : AppColors.primary,
                    ),
                  ),
                ),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: defaultStyle,
                      children: _parseInlineSpans(bulletText, defaultStyle),
                    ),
                  ),
                ),
              ],
            ),
          );
        }

        // 5. Numbered list items: 1. Item, 2. Item
        final numRegex = RegExp(r'^(\d+[\.\)])\s+(.+)$');
        final numMatch = numRegex.firstMatch(trimmed);
        if (numMatch != null) {
          final prefix = numMatch.group(1)!;
          final itemText = numMatch.group(2)!;
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 1.5),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: Text(
                    prefix,
                    style: TextStyle(
                      fontSize: (defaultStyle.fontSize ?? 13.5) * 0.95,
                      fontWeight: FontWeight.bold,
                      color: isUser
                          ? Colors.white.withValues(alpha: 0.85)
                          : AppColors.primaryDark,
                    ),
                  ),
                ),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: defaultStyle,
                      children: _parseInlineSpans(itemText, defaultStyle),
                    ),
                  ),
                ),
              ],
            ),
          );
        }

        // 6. Regular text paragraph
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 1),
          child: RichText(
            text: TextSpan(
              style: defaultStyle,
              children: _parseInlineSpans(line, defaultStyle),
            ),
          ),
        );
      }).toList(),
    );
  }

  /// Parses inline markdown tags (***bold italic***, **bold**, *italic*, `code`)
  /// and strips out any remaining literal *** or ** tags.
  List<InlineSpan> _parseInlineSpans(
    String raw,
    TextStyle defaultStyle, {
    bool isHeading = false,
  }) {
    final spans = <InlineSpan>[];
    final boldColor = isUser
        ? Colors.white
        : (isHeading ? AppColors.primaryDark : AppColors.textPrimary);

    // Matches:
    // 1: ***text***
    // 2: **text**
    // 3: *text*
    // 4: `code`
    final tokenRegex = RegExp(
      r'(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|\*[^\*\n]+?\*|`[^`\n]+`)',
    );

    int lastIndex = 0;
    for (final match in tokenRegex.allMatches(raw)) {
      if (match.start > lastIndex) {
        final preText = raw.substring(lastIndex, match.start);
        final sanitizedPre = preText.replaceAll('***', '').replaceAll('**', '');
        if (sanitizedPre.isNotEmpty) {
          spans.add(TextSpan(text: sanitizedPre));
        }
      }

      final token = match.group(0)!;

      if (token.startsWith('***') && token.endsWith('***') && token.length > 6) {
        final inner = token.substring(3, token.length - 3).trim();
        spans.add(
          TextSpan(
            text: inner,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: isUser ? Colors.white : AppColors.primaryDark,
            ),
          ),
        );
      } else if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
        final inner = token.substring(2, token.length - 2).trim();
        spans.add(
          TextSpan(
            text: inner,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: boldColor,
            ),
          ),
        );
      } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
        final inner = token.substring(1, token.length - 1).trim();
        spans.add(
          TextSpan(
            text: inner,
            style: const TextStyle(fontStyle: FontStyle.italic),
          ),
        );
      } else if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
        final inner = token.substring(1, token.length - 1);
        spans.add(
          WidgetSpan(
            alignment: PlaceholderAlignment.middle,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
              decoration: BoxDecoration(
                color: isUser
                    ? Colors.white.withValues(alpha: 0.2)
                    : AppColors.primaryLight,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                inner,
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: (defaultStyle.fontSize ?? 13.5) * 0.9,
                  color: isUser ? Colors.white : AppColors.primaryDark,
                ),
              ),
            ),
          ),
        );
      }

      lastIndex = match.end;
    }

    if (lastIndex < raw.length) {
      final postText = raw.substring(lastIndex);
      final sanitizedPost = postText.replaceAll('***', '').replaceAll('**', '');
      if (sanitizedPost.isNotEmpty) {
        spans.add(TextSpan(text: sanitizedPost));
      }
    }

    return spans;
  }
}
