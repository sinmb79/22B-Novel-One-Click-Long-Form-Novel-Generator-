import { DatabaseSync } from "node:sqlite";

export interface MemoryBootstrapOptions {
  projectName?: string;
}

export type NovelMemoryDatabase = DatabaseSync;

const schemaSql = `
CREATE TABLE IF NOT EXISTS project_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS character_states (
  id INTEGER PRIMARY KEY,
  character_id TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  physical_state TEXT,
  emotional_state TEXT,
  location TEXT,
  knowledge TEXT,
  relationships_delta TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS world_states (
  id INTEGER PRIMARY KEY,
  chapter_number INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapter_summaries (
  chapter_number INTEGER PRIMARY KEY,
  summary TEXT NOT NULL,
  key_events TEXT,
  characters_present TEXT,
  word_count INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memory_embeddings (
  id INTEGER PRIMARY KEY,
  chapter_number INTEGER,
  content_type TEXT,
  content TEXT NOT NULL,
  embedding BLOB NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS foreshadowing (
  id INTEGER PRIMARY KEY,
  seed_id TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  seed_chapter INTEGER,
  seed_text TEXT,
  hint_chapters TEXT,
  payoff_chapter INTEGER,
  payoff_text TEXT,
  status TEXT DEFAULT 'seeded',
  importance TEXT DEFAULT 'minor',
  scheduled_payoff INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emotion_curve (
  chapter_number INTEGER PRIMARY KEY,
  designed_tension REAL,
  actual_tension REAL,
  emotion_tags TEXT,
  notes TEXT
);
`;

export function createNovelMemoryDatabase(
  filename: string,
  options: MemoryBootstrapOptions = {},
): NovelMemoryDatabase {
  const db = new DatabaseSync(filename);

  db.exec(schemaSql);

  if (options.projectName) {
    const statement = db.prepare(
      `
      INSERT INTO project_meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `,
    );

    statement.run("project_name", options.projectName);
  }

  return db;
}

export function listTableNames(db: NovelMemoryDatabase): string[] {
  const rows = db
    .prepare(
      `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
      ORDER BY name
      `,
    )
    .all() as Array<{ name: string }>;

  return rows.map((row) => row.name);
}

export function readProjectMeta(db: NovelMemoryDatabase, key: string): string | null {
  const row = db
    .prepare("SELECT value FROM project_meta WHERE key = ?")
    .get(key) as { value: string } | undefined;

  return row?.value ?? null;
}
