import React from "react";

interface FormattedChatMessageProps {
  text: string;
  isUser?: boolean;
  className?: string;
}

/**
 * Parses and renders chat message text with rich clinical formatting:
 * - High-contrast, crystal-clear typography in Bengali and English.
 * - Correct header rendering (### Header, **Header:**, etc.) with deep clinical teal (#0F766E).
 * - Bullet lists (*, -, •) and numbered lists (supports both English 1-9 and Bengali ১-৯).
 * - Highlighted clinical warnings (⚠️) with soft medical advisory pill.
 * - Strips any stray rogue markdown asterisks so text is always clean.
 * - Robust color contrast on white backgrounds regardless of OS dark/light mode preference.
 */
export function FormattedChatMessage({
  text,
  isUser = false,
  className = "",
}: FormattedChatMessageProps) {
  if (!text) return null;

  // Render inline formatting (bold, italic, code) without literal asterisks
  const renderInline = (raw: string, isHeadingContext: boolean = false) => {
    // Regex matches:
    // 1: ***text*** (bold + italic / strong header)
    // 2: **text** (bold)
    // 3: *text* (italic / emphasis)
    // 4: `code`
    const regex = /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|\*[^\*\n]+?\*|`[^`\n]+`)/g;
    const parts = raw.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // ***text*** -> Strong emphasis
      if (part.startsWith("***") && part.endsWith("***") && part.length > 6) {
        const inner = part.slice(3, -3).trim();
        return (
          <strong
            key={i}
            className={
              isUser
                ? "font-bold text-white underline-offset-2"
                : isHeadingContext
                ? "font-bold text-inherit"
                : "font-bold text-[#0F766E]"
            }
          >
            {inner}
          </strong>
        );
      }

      // **text** -> Bold
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        const inner = part.slice(2, -2).trim();
        return (
          <strong
            key={i}
            className={
              isUser
                ? "font-bold text-white"
                : isHeadingContext
                ? "font-bold text-inherit"
                : "font-bold text-slate-900"
            }
          >
            {inner}
          </strong>
        );
      }

      // *text* -> Italic
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        const inner = part.slice(1, -1).trim();
        return (
          <em
            key={i}
            className={`italic ${isUser ? "text-teal-100" : "text-slate-700"}`}
          >
            {inner}
          </em>
        );
      }

      // `code` -> inline code
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
        const inner = part.slice(1, -1);
        return (
          <code
            key={i}
            className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono ${
              isUser
                ? "bg-teal-800/60 text-teal-100"
                : "bg-slate-100 text-slate-800 border border-slate-200"
            }`}
          >
            {inner}
          </code>
        );
      }

      // Plain text part: sanitize any remaining rogue *** or ** tags
      const sanitized = part.replace(/\*{2,3}/g, "");
      return <React.Fragment key={i}>{sanitized}</React.Fragment>;
    });
  };

  const lines = text.split("\n");

  return (
    <div className={`space-y-1.5 leading-relaxed font-bangla ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // 2. Horizontal divider: *** or --- or ___
        if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
          return (
            <hr
              key={idx}
              className={`my-2.5 border-t ${
                isUser ? "border-teal-400/40" : "border-slate-200"
              }`}
            />
          );
        }

        // 3. Headings: ### Header or ## Header or # Header or standalone **Header:**
        const isMarkdownHeading = /^#{1,4}\s+/.test(trimmed);
        const isStandaloneBoldHeader =
          /^\*\*[^*]+?\*\*:?$/.test(trimmed) && trimmed.length < 120;

        if (isMarkdownHeading || isStandaloneBoldHeader) {
          let headingText = isMarkdownHeading
            ? trimmed.replace(/^#{1,4}\s+/, "").trim()
            : trimmed.replace(/^\*\*/, "").replace(/\*\*:?$/, ":").trim();

          // Strip any redundant surrounding bold markers from heading (e.g. ### **Title** -> Title)
          if (
            headingText.startsWith("**") &&
            headingText.endsWith("**") &&
            headingText.length > 4
          ) {
            headingText = headingText.slice(2, -2).trim();
          }

          return (
            <div
              key={idx}
              className={`font-bold mt-2.5 mb-1 tracking-normal ${
                isUser
                  ? "text-white text-xs sm:text-sm"
                  : "text-[#0F766E] text-xs sm:text-sm font-bold"
              }`}
            >
              {renderInline(headingText, true)}
            </div>
          );
        }

        // 4. Medical Disclaimer / Warning (⚠️)
        if (trimmed.startsWith("⚠️")) {
          const warningContent = trimmed.replace(/^⚠️\s*/, "");
          return (
            <div
              key={idx}
              className={`mt-2.5 p-2.5 rounded-lg text-[11px] sm:text-[11.5px] leading-relaxed flex items-start gap-2 ${
                isUser
                  ? "bg-teal-900/40 text-teal-100 border border-teal-500/30"
                  : "bg-amber-50/90 text-amber-900 border border-amber-200/90 shadow-2xs"
              }`}
            >
              <span className="flex-shrink-0 text-sm leading-none mt-0.5 select-none">
                ⚠️
              </span>
              <div className="flex-1 font-medium">
                {renderInline(warningContent)}
              </div>
            </div>
          );
        }

        // 5. Bullet lists: * Item, - Item, • Item
        if (/^[\*\-•]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[\*\-•]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5 ml-1">
              <span
                className={`text-[12px] leading-tight select-none mt-0.5 ${
                  isUser ? "text-teal-200" : "text-[#0F766E]"
                }`}
              >
                •
              </span>
              <span
                className={`flex-1 ${
                  isUser ? "text-white" : "text-slate-800"
                }`}
              >
                {renderInline(bulletText)}
              </span>
            </div>
          );
        }

        // 6. Numbered lists: 1. Item, ১. Item (supports Bengali & English digits)
        const numMatch = trimmed.match(/^([0-9০-৯]+[\.\)])\s+(.+)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 my-1 ml-0.5">
              <span
                className={`font-bold text-[11.5px] sm:text-xs select-none ${
                  isUser ? "text-teal-200" : "text-[#0F766E]"
                }`}
              >
                {numMatch[1]}
              </span>
              <span
                className={`flex-1 ${
                  isUser ? "text-white" : "text-slate-800"
                }`}
              >
                {renderInline(numMatch[2])}
              </span>
            </div>
          );
        }

        // 7. Regular paragraph
        return (
          <p
            key={idx}
            className={`m-0 ${isUser ? "text-white" : "text-slate-800"}`}
          >
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export default FormattedChatMessage;
