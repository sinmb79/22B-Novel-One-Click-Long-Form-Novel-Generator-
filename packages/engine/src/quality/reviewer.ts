import { runConsistencyCheck } from "./consistency.js";
import { runForeshadowAudit } from "./foreshadow-audit.js";
import { runVoiceMatchCheck } from "./voice-match.js";

import type { ReviewChapterInput, ReviewChapterResult, ReviewIssue } from "./types.js";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getMinimumWordThreshold(targetWordCount: number): number {
  return Math.max(120, Math.min(1200, Math.floor(targetWordCount * 0.25)));
}

function runLengthCheck(
  chapterNumber: number,
  wordCount: number,
  targetWordCount: number,
): ReviewIssue[] {
  const minimum = getMinimumWordThreshold(targetWordCount);

  if (wordCount >= minimum) {
    return [];
  }

  return [
    {
      chapterNumber,
      severity: "warning",
      rule: "length",
      message: `Chapter ${chapterNumber} is too short (${wordCount} words, expected at least ${minimum}).`,
    },
  ];
}

export function reviewChapter({
  chapterNumber,
  text,
  authorDNA,
  chapterWordCountTarget,
  db,
}: ReviewChapterInput): ReviewChapterResult {
  const wordCount = countWords(text);
  const issues: ReviewIssue[] = [
    ...runLengthCheck(chapterNumber, wordCount, chapterWordCountTarget),
    ...runConsistencyCheck(chapterNumber, text, authorDNA),
    ...runVoiceMatchCheck(chapterNumber, text, authorDNA),
    ...runForeshadowAudit(db, chapterNumber),
  ];

  return {
    chapterNumber,
    wordCount,
    issues,
  };
}
