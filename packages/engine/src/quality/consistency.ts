import type { AuthorDNA } from "../author-dna/types.js";
import type { ReviewIssue } from "./types.js";

export function runConsistencyCheck(
  chapterNumber: number,
  text: string,
  authorDNA: AuthorDNA,
): ReviewIssue[] {
  const protagonist = authorDNA.characters.find((character) => character.role === "protagonist");

  if (!protagonist) {
    return [];
  }

  if (text.toLowerCase().includes(protagonist.name.toLowerCase())) {
    return [];
  }

  return [
    {
      chapterNumber,
      severity: "critical",
      rule: "consistency",
      message: `Protagonist "${protagonist.name}" is not referenced in chapter ${chapterNumber}.`,
    },
  ];
}
