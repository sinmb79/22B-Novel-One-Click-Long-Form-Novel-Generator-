import type { NovelMemoryDatabase } from "./db.js";

export interface CharacterStateChange {
  characterId: string;
  physicalState?: string;
  emotionalState?: string;
  location?: string;
  knowledge?: string;
  relationshipsDelta?: string;
}

export interface WorldStateChange {
  key: string;
  value: string;
}

export interface ForeshadowUpdate {
  seedId: string;
  description: string;
  seedChapter: number;
  seedText?: string;
  status: string;
}

export interface AutoCommitChapterInput {
  chapterNumber: number;
  text: string;
  chapterSummary: string;
  keyEvents: string[];
  charactersPresent: string[];
  characterStateChanges: CharacterStateChange[];
  worldStateChanges: WorldStateChange[];
  foreshadowUpdates: ForeshadowUpdate[];
}

export function autoCommitChapter(
  db: NovelMemoryDatabase,
  input: AutoCommitChapterInput,
): void {
  db.prepare(
    `
    INSERT INTO chapter_summaries (
      chapter_number,
      summary,
      key_events,
      characters_present,
      word_count
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(chapter_number) DO UPDATE SET
      summary = excluded.summary,
      key_events = excluded.key_events,
      characters_present = excluded.characters_present,
      word_count = excluded.word_count
    `,
  ).run(
    input.chapterNumber,
    input.chapterSummary,
    JSON.stringify(input.keyEvents),
    JSON.stringify(input.charactersPresent),
    input.text.trim().split(/\s+/).filter(Boolean).length,
  );

  const insertCharacterState = db.prepare(
    `
    INSERT INTO character_states (
      character_id,
      chapter_number,
      physical_state,
      emotional_state,
      location,
      knowledge,
      relationships_delta
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
  );
  const insertWorldState = db.prepare(
    `
    INSERT INTO world_states (chapter_number, key, value)
    VALUES (?, ?, ?)
    `,
  );
  const upsertForeshadow = db.prepare(
    `
    INSERT INTO foreshadowing (
      seed_id,
      description,
      seed_chapter,
      seed_text,
      status
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(seed_id) DO UPDATE SET
      description = excluded.description,
      seed_chapter = excluded.seed_chapter,
      seed_text = excluded.seed_text,
      status = excluded.status
    `,
  );

  for (const change of input.characterStateChanges) {
    insertCharacterState.run(
      change.characterId,
      input.chapterNumber,
      change.physicalState ?? null,
      change.emotionalState ?? null,
      change.location ?? null,
      change.knowledge ?? null,
      change.relationshipsDelta ?? null,
    );
  }

  for (const change of input.worldStateChanges) {
    insertWorldState.run(input.chapterNumber, change.key, change.value);
  }

  for (const update of input.foreshadowUpdates) {
    upsertForeshadow.run(
      update.seedId,
      update.description,
      update.seedChapter,
      update.seedText ?? null,
      update.status,
    );
  }
}
