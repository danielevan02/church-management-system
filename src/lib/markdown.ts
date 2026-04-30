/**
 * Strip the most common markdown syntax from a string and return plain
 * text suitable for excerpts (list cards) and push-notification bodies,
 * which can't render markdown. Keeps the original word order; only
 * removes formatting markers.
 */
export function stripMarkdown(input: string): string {
  if (!input) return "";
  return (
    input
      // images: ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      // links: [text](url) → text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // fenced code blocks
      .replace(/```[\s\S]*?```/g, "")
      // inline code
      .replace(/`([^`]+)`/g, "$1")
      // headings
      .replace(/^#{1,6}\s+/gm, "")
      // blockquote markers
      .replace(/^\s*>\s?/gm, "")
      // list markers (-, *, +) and ordered list (1., 2., …)
      .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
      // bold + italic markers
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // strikethrough
      .replace(/~~(.*?)~~/g, "$1")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function excerpt(input: string, max = 120): string {
  const stripped = stripMarkdown(input);
  return stripped.length <= max ? stripped : `${stripped.slice(0, max - 1)}…`;
}
