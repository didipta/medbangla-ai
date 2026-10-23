import React from "react";

interface FormattedChatMessageProps {
  text: string;
  isUser?: boolean;
  className?: string;
}

/**
 * Parses and renders chat message text with rich clinical formatting:
 * - Transforms ***bold italic*** / ***bold*** / **bold** into clean styled text.
 * - Converts standalone *** / --- into subtle horizontal dividers.
 * - Formats headings (###) and bullet/numbered lists cleanly.
 * - Completely strips any raw/stray *** or ** tags so users never see raw markdown markers.
 */
export function FormattedChatMessage({
  text,
  isUser = false,
  className = "",
}: FormattedChatMessageProps) {
  if (!text) return null;

  // Render inline formatting (bold, italic, code) without literal asterisks
  const renderInline = (raw: string) => {
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
                : "font-bold text-[#0F766E] dark:text-teal-400"
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
                : "font-semibold text-slate-900 dark:text-zinc-100"
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
          <em key={i} className="italic opacity-90">
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
                : "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-200"
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
    <div className={`space-y-1.5 leading-relaxed ${className}`}>
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
                isUser ? "border-teal-400/40" : "border-slate-200 dark:border-zinc-700"
              }`}
            />
          );
        }

        // 3. Headings: ### Header or ## Header or # Header
        if (/^#{1,4}\s+/.test(trimmed)) {
          const headingText = trimmed.replace(/^#{1,4}\s+/, "");
          return (
            <div
              key={idx}
              className={`font-bold mt-2 mb-1 ${
                isUser
                  ? "text-white text-xs sm:text-sm"
                  : "text-[#0F766E] dark:text-teal-400 text-xs sm:text-sm"
              }`}
            >
              {renderInline(headingText)}
            </div>
          );
        }

        // 4. Bullet lists: * Item, - Item, • Item
        if (/^[\*\-•]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[\*\-•]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5 ml-1">
              <span
                className={`text-[12px] leading-tight select-none mt-0.5 ${
                  isUser ? "text-teal-200" : "text-[#0F766E] dark:text-teal-400"
                }`}
              >
                •
              </span>
              <span className="flex-1">{renderInline(bulletText)}</span>
            </div>
          );
        }

        // 5. Numbered lists: 1. Item, 2. Item
        const numMatch = trimmed.match(/^(\d+[\.\)])\s+(.+)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 my-0.5 ml-1">
              <span
                className={`font-semibold text-[11px] select-none ${
                  isUser ? "text-teal-200" : "text-[#0F766E] dark:text-teal-400"
                }`}
              >
                {numMatch[1]}
              </span>
              <span className="flex-1">{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // 6. Regular paragraph
        return (
          <p key={idx} className="m-0">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export default FormattedChatMessage;
