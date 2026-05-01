import { describe, expect, it } from "vitest";

import { excerpt, stripMarkdown } from "./markdown";

describe("stripMarkdown", () => {
  it("removes bold and italic markers", () => {
    expect(stripMarkdown("**bold** and _italic_")).toBe("bold and italic");
  });

  it("removes link syntax but keeps text", () => {
    expect(stripMarkdown("Visit [our site](https://example.com) today")).toBe(
      "Visit our site today",
    );
  });

  it("removes heading hashes", () => {
    expect(stripMarkdown("# Heading 1\n## Heading 2")).toBe("Heading 1 Heading 2");
  });

  it("removes list markers and collapses whitespace", () => {
    expect(stripMarkdown("- item one\n- item two\n- item three")).toBe(
      "item one item two item three",
    );
  });

  it("returns empty string for empty input", () => {
    expect(stripMarkdown("")).toBe("");
  });
});

describe("excerpt", () => {
  it("returns the full string when shorter than max", () => {
    expect(excerpt("Short text", 50)).toBe("Short text");
  });

  it("truncates long text with ellipsis", () => {
    const long = "a".repeat(200);
    const result = excerpt(long, 50);
    expect(result.length).toBe(50);
    expect(result.endsWith("…")).toBe(true);
  });

  it("strips markdown before measuring length", () => {
    // "**bold**" is 8 chars but renders as "bold" (4 chars)
    expect(excerpt("**bold**", 10)).toBe("bold");
  });
});
