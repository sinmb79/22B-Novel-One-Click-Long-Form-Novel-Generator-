import type { NovelMemoryDatabase } from "../memory/db.js";
import type { ReviewIssue } from "./types.js";

export function runForeshadowAudit(
  db: NovelMemoryDatabase,
  chapterNumber: number,
): ReviewIssue[] {
  const rows = db
    .prepare(
      `
      SELECT seed_id, description, seed_chapter, status
      FROM foreshadowing
      WHERE seed_chapter < ?
        AND status NOT IN ('paid_off', 'resolved', 'payoff')
      ORDER BY seed_chapter, seed_id
      `,
    )
    .all(chapterNumber) as Array<{
    seed_id: string;
    description: string;
    seed_chapter: number | null;
    status: string;
  }>;

  return rows.map((row) => ({
    chapterNumber,
    severity: "warning" as const,
    rule: "foreshadow" as const,
    message: `Foreshadow seed "${row.seed_id}" from chapter ${row.seed_chapter ?? "unknown"} is still unresolved.`,
  }));
}
