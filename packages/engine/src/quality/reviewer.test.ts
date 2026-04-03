import { describe, expect, it } from "vitest";

import { createSampleAuthorDNA } from "../test/fixtures.js";
import { autoCommitChapter } from "../memory/auto-commit.js";
import { createNovelMemoryDatabase } from "../memory/db.js";
import { reviewChapter } from "./reviewer.js";

describe("reviewChapter", () => {
  it("flags short chapters, protagonist continuity issues, and unresolved foreshadowing", () => {
    const db = createNovelMemoryDatabase(":memory:");

    autoCommitChapter(db, {
      chapterNumber: 1,
      text: "Seo Yoon plants a silent promise in the flooded archive.",
      chapterSummary: "A silent promise is planted.",
      keyEvents: ["A seed is planted."],
      charactersPresent: ["Seo Yoon"],
      characterStateChanges: [],
      worldStateChanges: [],
      foreshadowUpdates: [
        {
          seedId: "vault-promise",
          description: "The vault pulse will demand a cost later.",
          seedChapter: 1,
          status: "seeded",
        },
      ],
    });

    const result = reviewChapter({
      chapterNumber: 3,
      text: "The harbor shakes. The vault pulses again.",
      authorDNA: createSampleAuthorDNA(),
      chapterWordCountTarget: 3000,
      db,
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: "length", severity: "warning" }),
        expect.objectContaining({ rule: "consistency", severity: "critical" }),
        expect.objectContaining({ rule: "foreshadow", severity: "warning" }),
      ]),
    );

    db.close();
  });

  it("passes a chapter that is long enough, mentions the protagonist, and has no stale seeds", () => {
    const db = createNovelMemoryDatabase(":memory:");
    const text = Array.from(
      { length: 220 },
      () => "Seo Yoon studies the archive tide and chooses mercy over panic.",
    ).join(" ");

    const result = reviewChapter({
      chapterNumber: 1,
      text,
      authorDNA: createSampleAuthorDNA(),
      chapterWordCountTarget: 3000,
      db,
    });

    expect(result.issues).toEqual([]);

    db.close();
  });
});
