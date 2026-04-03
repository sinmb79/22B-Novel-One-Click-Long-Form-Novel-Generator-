import { afterEach, describe, expect, it } from "vitest";

import {
  createNovelMemoryDatabase,
  listTableNames,
  readProjectMeta,
} from "./db.js";

const openDatabases: Array<{ close: () => void }> = [];

afterEach(() => {
  while (openDatabases.length > 0) {
    openDatabases.pop()?.close();
  }
});

describe("createNovelMemoryDatabase", () => {
  it("creates all required memory tables", () => {
    const db = createNovelMemoryDatabase(":memory:");
    openDatabases.push(db);

    expect(listTableNames(db)).toEqual(
      expect.arrayContaining([
        "project_meta",
        "character_states",
        "world_states",
        "chapter_summaries",
        "memory_embeddings",
        "foreshadowing",
        "emotion_curve",
      ]),
    );
  });

  it("stores project metadata during bootstrap", () => {
    const db = createNovelMemoryDatabase(":memory:", { projectName: "demo-project" });
    openDatabases.push(db);

    expect(readProjectMeta(db, "project_name")).toBe("demo-project");
  });
});
