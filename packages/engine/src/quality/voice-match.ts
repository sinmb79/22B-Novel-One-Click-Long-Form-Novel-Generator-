import type { AuthorDNA } from "../author-dna/types.js";
import type { ReviewIssue } from "./types.js";

function toNeedle(text: string): string {
  return text.trim().toLowerCase();
}

export function runVoiceMatchCheck(
  chapterNumber: number,
  text: string,
  authorDNA: AuthorDNA,
): ReviewIssue[] {
  const normalized = toNeedle(text);
  const violations = authorDNA.philosophy.neverDo.filter((entry) => {
    const needle = toNeedle(entry);
    return needle.length > 0 && normalized.includes(needle);
  });

  return violations.map((entry) => ({
    chapterNumber,
    severity: "warning" as const,
    rule: "voice" as const,
    message: `Chapter ${chapterNumber} contains prohibited phrasing from author DNA: "${entry}".`,
  }));
}
