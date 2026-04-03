import { afterEach, describe, expect, it } from "vitest";

import { autoCommitChapter } from "./auto-commit.js";
import { createNovelMemoryDatabase } from "./db.js";

const openDatabases: Array<{ close: () => void }> = [];

afterEach(() => {
  while (openDatabases.length > 0) {
    openDatabases.pop()?.close();
  }
});

describe("autoCommitChapter", () => {
  it("persists chapter summary, character state, and world state updates", () => {
    const db = createNovelMemoryDatabase(":memory:");
    openDatabases.push(db);

    autoCommitChapter(db, {
      chapterNumber: 1,
      text: "Seo Yoon hears the tidewall hum beneath the market.",
      chapterSummary: "Seo Yoon discovers the vault signal under Lower Harbor.",
      keyEvents: ["Vault signal discovered"],
      charactersPresent: ["protagonist", "mentor"],
      characterStateChanges: [
        {
          characterId: "protagonist",
          emotionalState: "uneasy",
          location: "lower-harbor",
        },
      ],
      worldStateChanges: [
        {
          key: "vault_status",
          value: "resonating",
        },
      ],
      foreshadowUpdates: [
        {
          seedId: "tidewall-hum",
          description: "A changing hum in the tidewall hints at a sealed vault.",
          seedChapter: 1,
          status: "seeded",
        },
      ],
    });

    const summary = db
      .prepare("SELECT summary FROM chapter_summaries WHERE chapter_number = 1")
      .get() as { summary: string };
    const state = db
      .prepare("SELECT emotional_state FROM character_states WHERE chapter_number = 1")
      .get() as { emotional_state: string };
    const world = db
      .prepare("SELECT value FROM world_states WHERE chapter_number = 1 AND key = 'vault_status'")
      .get() as { value: string };
    const foreshadow = db
      .prepare("SELECT status FROM foreshadowing WHERE seed_id = 'tidewall-hum'")
      .get() as { status: string };

    expect(summary.summary).toContain("vault signal");
    expect(state.emotional_state).toBe("uneasy");
    expect(world.value).toBe("resonating");
    expect(foreshadow.status).toBe("seeded");
  });
});
