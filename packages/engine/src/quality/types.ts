import type { AuthorDNA } from "../author-dna/types.js";
import type { NovelMemoryDatabase } from "../memory/db.js";

export interface ReviewIssue {
  chapterNumber: number;
  severity: "warning" | "critical";
  rule: "length" | "consistency" | "voice" | "foreshadow" | "missing-file";
  message: string;
}

export interface ReviewChapterInput {
  chapterNumber: number;
  text: string;
  authorDNA: AuthorDNA;
  chapterWordCountTarget: number;
  db: NovelMemoryDatabase;
}

export interface ReviewChapterResult {
  chapterNumber: number;
  wordCount: number;
  issues: ReviewIssue[];
}
