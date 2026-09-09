import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

type Props = {
  source: string;
  className?: string;
  /**
   * Which palette to render in.
   *
   * `app` (default) uses the M3 roles and follows the visitor's theme — right
   * for the member portal and the admin screens.
   *
   * `paper` uses the landing page's `lp-*` tokens, which are declared once and
   * never redefined under `.dark`. The public devotional pages need it: they
   * sit on the same warm paper ground as the landing page, and an M3-toned
   * body would render as light-on-dark prose inside a light page for any
   * visitor whose OS is set to dark.
   */
  tone?: "app" | "paper";
};

const TONE = {
  app: [
    "text-on-surface",
    "prose-headings:text-on-surface prose-strong:text-on-surface prose-a:text-primary",
    "prose-blockquote:border-primary/30 prose-blockquote:text-on-surface-variant",
  ],
  paper: [
    "text-lp-ink-soft",
    "prose-headings:text-lp-ink prose-headings:font-display prose-headings:font-extrabold prose-headings:tracking-[-0.02em]",
    "prose-strong:text-lp-ink prose-a:text-lp-accent prose-a:underline-offset-2",
    "prose-blockquote:border-lp-accent/40 prose-blockquote:text-lp-ink",
  ],
} as const;

/**
 * Markdown renderer. Whitelisted to a small subset: paragraphs, line breaks,
 * bold/italic, lists, links, headings (h2-h4), blockquotes, code spans. No raw
 * HTML, no iframes — react-markdown default behavior, safe by construction.
 */
export function MarkdownContent({ source, className, tone = "app" }: Props) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none break-words leading-relaxed",
        "prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
        "prose-blockquote:border-l-2 prose-blockquote:pl-3 prose-blockquote:italic",
        TONE[tone],
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
