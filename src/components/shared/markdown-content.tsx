import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

type Props = {
  source: string;
  className?: string;
};

/**
 * Member-facing markdown renderer. Whitelisted to a small subset:
 * paragraphs, line breaks, bold/italic, lists, links, headings (h2-h4),
 * blockquotes, code spans. No raw HTML, no iframes — react-markdown
 * default behavior, safe by construction.
 */
export function MarkdownContent({ source, className }: Props) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none break-words leading-relaxed text-foreground",
        // tame prose colors so it works on both light and dark inboxes
        "prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary",
        "prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
        "prose-blockquote:border-l-2 prose-blockquote:border-primary/30 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground",
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
