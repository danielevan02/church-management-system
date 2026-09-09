import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

type Props = {
  source: string;
  className?: string;
  /**
   * Which palette and type scale to render in.
   *
   * `app` (default) uses the M3 roles and Tailwind Typography, and follows the
   * visitor's theme — right for the member portal and the admin screens.
   *
   * `paper` hands the body to `.sm-prose` in the public stylesheet instead.
   * Two reasons, and the second is the one that made it necessary:
   *
   * 1. The M3 roles flip under `.dark`. A public devotional read by someone
   *    whose OS is in dark mode would render as light-on-dark prose inside a
   *    warm paper page.
   * 2. `@tailwindcss/typography` brings its own families, sizes and leading.
   *    On a page whose whole typographic argument is one serif against one
   *    grotesque at fixed roles, prose in a third voice is exactly the
   *    incoherence the `sm-*` scale exists to prevent.
   */
  tone?: "app" | "paper";
};

/**
 * Member-facing markdown renderer. Whitelisted to a small subset:
 * paragraphs, line breaks, bold/italic, lists, links, headings (h2-h4),
 * blockquotes, code spans. No raw HTML, no iframes — react-markdown
 * default behavior, safe by construction.
 */
export function MarkdownContent({ source, className, tone = "app" }: Props) {
  if (tone === "paper") {
    return (
      <div className={cn("sm-prose", className)}>
        <ReactMarkdown>{source}</ReactMarkdown>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none break-words leading-relaxed text-on-surface",
        // tame prose colors so it works on both light and dark inboxes
        "prose-headings:text-on-surface prose-strong:text-on-surface prose-a:text-primary",
        "prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
        "prose-blockquote:border-l-2 prose-blockquote:border-primary/30 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-on-surface-variant",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          // Always open external links in a new tab.
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
