# 22B Novel Engine — Codex Implementation Spec

## Project: 22B-Novel (One-Click Long-Form Novel Generator)
**Owner:** 22B Labs (sinmb79)
**Stack:** TypeScript + MCP Server + SQLite + sqlite-vec + CLI + Next.js Dashboard
**License:** MIT
**Repo:** `sinmb79/22b-novel`

---

## 1. Product Vision

A tool that generates 100–200+ chapter novels from a single configuration.
Users define their Author DNA (philosophy, characters, world, style), press go,
and the engine produces consistent, plot-coherent long-form fiction automatically.

**Core Differentiators vs Sudowrite/NovelCrafter:**
- AUTOMATED generation (not just "assisted writing")
- Author DNA system preserves writer's philosophy & style across all chapters
- Memory DB with auto-commit (no manual Codex updates)
- Foreshadowing tracker (seed → hint → payoff, auto-managed)
- Emotion curve designer (tension graph across 200 chapters)
- Model tier routing (Opus for plot, Sonnet for prose, Haiku for QA)
- BYOK: Anthropic, OpenAI, Google, local models
- Korean web novel format native (회차 structure, genre conventions)
- EPUB/PDF auto-build
- MCP Server as primary interface (works in Claude Desktop, Cursor, etc.)

---

## 2. Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    22B Novel Engine                         │
│                                                            │
│  ┌──────────────────┐    ┌─────────────────────────────┐   │
│  │   MCP Server      │    │   CLI                       │   │
│  │   (Primary UI)    │    │   (Batch generation)        │   │
│  │                   │    │                             │   │
│  │   novel:init      │    │   novel generate --from 1   │   │
│  │   novel:plot      │    │         --to 50             │   │
│  │   novel:generate  │    │         --model sonnet      │   │
│  │   novel:memory    │    │                             │   │
│  │   novel:export    │    │   novel export --epub       │   │
│  │   novel:status    │    │   novel cost --estimate     │   │
│  │   novel:review    │    │                             │   │
│  └────────┬──────────┘    └──────────┬──────────────────┘   │
│           │                          │                      │
│           └──────────┬───────────────┘                      │
│                      │                                      │
│           ┌──────────▼──────────┐                           │
│           │   Engine Core       │                           │
│           │                     │                           │
│           │   ┌───────────────┐ │                           │
│           │   │ Author DNA    │ │  ← Philosophy, style,    │
│           │   │ Manager       │ │    character souls        │
│           │   └───────┬───────┘ │                           │
│           │           │         │                           │
│           │   ┌───────▼───────┐ │                           │
│           │   │ Plot Architect│ │  ← Arc structure,        │
│           │   │               │ │    emotion curve          │
│           │   └───────┬───────┘ │                           │
│           │           │         │                           │
│           │   ┌───────▼───────┐ │                           │
│           │   │ Chapter       │ │  ← Beat decomposition,   │
│           │   │ Generator     │ │    prose generation       │
│           │   └───────┬───────┘ │                           │
│           │           │         │                           │
│           │   ┌───────▼───────┐ │                           │
│           │   │ Memory DB     │ │  ← SQLite + sqlite-vec   │
│           │   │ (Auto-commit) │ │    Character state,       │
│           │   └───────┬───────┘ │    foreshadowing,         │
│           │           │         │    world state             │
│           │   ┌───────▼───────┐ │                           │
│           │   │ Quality       │ │  ← Consistency check,     │
│           │   │ Reviewer      │ │    character voice,        │
│           │   └───────────────┘ │    foreshadow tracking     │
│           └─────────────────────┘                           │
│                                                            │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ Model Router     │    │ Web Dashboard    │              │
│  │ (BYOK)           │    │ (Next.js)        │              │
│  │                  │    │                  │              │
│  │ Plot → Opus      │    │ - Project mgmt   │              │
│  │ Prose → Sonnet   │    │ - Progress view  │              │
│  │ QA   → Haiku     │    │ - Memory DB viz  │              │
│  │ Local → Ollama   │    │ - Cost tracker   │              │
│  └──────────────────┘    │ - Emotion curve  │              │
│                          └──────────────────┘              │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 0 — Core Engine

### 3.1 Directory Structure

```
22b-novel/
├── packages/
│   ├── engine/                       # Core engine
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── author-dna/
│   │   │   │   ├── types.ts          # Author DNA schema
│   │   │   │   ├── manager.ts        # Load, validate, inject
│   │   │   │   ├── philosophy.ts     # Philosophy statement handling
│   │   │   │   ├── character-soul.ts # Character personality engine
│   │   │   │   ├── style-profile.ts  # Scene-type → writing style
│   │   │   │   └── voice-checker.ts  # Verify character consistency
│   │   │   ├── plot/
│   │   │   │   ├── types.ts
│   │   │   │   ├── architect.ts      # Generate full arc structure
│   │   │   │   ├── arc-builder.ts    # Define arcs (e.g., SIGNAL/WEIGHT/FORGE)
│   │   │   │   ├── emotion-curve.ts  # Tension graph across all chapters
│   │   │   │   ├── beat-decomposer.ts # Chapter → scene beats
│   │   │   │   └── foreshadow/
│   │   │   │       ├── types.ts
│   │   │   │       ├── tracker.ts    # Seed/Hint/Payoff state machine
│   │   │   │       ├── scheduler.ts  # Auto-schedule payoff timing
│   │   │   │       └── validator.ts  # Warn on unresolved foreshadowing
│   │   │   ├── generator/
│   │   │   │   ├── types.ts
│   │   │   │   ├── chapter-generator.ts  # Main generation loop
│   │   │   │   ├── context-assembler.ts  # Build prompt context per chapter
│   │   │   │   ├── prompt-templates/
│   │   │   │   │   ├── plot-design.ts    # Prompt for arc generation
│   │   │   │   │   ├── beat-expand.ts    # Prompt for beat → prose
│   │   │   │   │   ├── dialogue.ts       # Prompt for dialogue
│   │   │   │   │   └── review.ts         # Prompt for QA review
│   │   │   │   └── post-processor.ts     # Clean up, format
│   │   │   ├── memory/
│   │   │   │   ├── types.ts
│   │   │   │   ├── db.ts                 # SQLite + sqlite-vec setup
│   │   │   │   ├── character-state.ts    # Track character current state
│   │   │   │   ├── world-state.ts        # Track world/setting changes
│   │   │   │   ├── chapter-summary.ts    # Auto-summarize each chapter
│   │   │   │   ├── rag-query.ts          # Vector search for relevant context
│   │   │   │   └── auto-commit.ts        # After generation, extract & commit
│   │   │   ├── quality/
│   │   │   │   ├── reviewer.ts           # Run all QA checks
│   │   │   │   ├── consistency.ts        # Character appearance/trait check
│   │   │   │   ├── voice-match.ts        # Does character sound right?
│   │   │   │   ├── foreshadow-audit.ts   # Unresolved seeds warning
│   │   │   │   ├── pacing.ts             # Chapter length variance
│   │   │   │   └── repetition.ts         # Detect repeated phrases/patterns
│   │   │   ├── model-router/
│   │   │   │   ├── types.ts
│   │   │   │   ├── router.ts             # Route tasks to appropriate model
│   │   │   │   ├── providers/
│   │   │   │   │   ├── anthropic.ts
│   │   │   │   │   ├── openai.ts
│   │   │   │   │   ├── google.ts
│   │   │   │   │   └── ollama.ts         # Local models
│   │   │   │   └── cost-calculator.ts    # Estimate token cost before generation
│   │   │   └── export/
│   │   │       ├── epub-builder.ts       # Chapters → EPUB
│   │   │       ├── pdf-builder.ts        # Chapters → PDF
│   │   │       ├── markdown.ts           # Chapters → MD files
│   │   │       └── webnovel-format.ts    # Korean web novel platform format
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mcp-server/                   # MCP Server (primary interface)
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   └── tools/
│   │   │       ├── init.ts           # novel:init
│   │   │       ├── plot.ts           # novel:plot
│   │   │       ├── generate.ts       # novel:generate
│   │   │       ├── memory.ts         # novel:memory
│   │   │       ├── export.ts         # novel:export
│   │   │       ├── status.ts         # novel:status
│   │   │       ├── review.ts         # novel:review
│   │   │       └── cost.ts           # novel:cost
│   │   └── package.json
│   │
│   ├── cli/                          # CLI for batch operations
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── commands/
│   │   │   │   ├── init.ts
│   │   │   │   ├── generate.ts
│   │   │   │   ├── export.ts
│   │   │   │   ├── status.ts
│   │   │   │   ├── review.ts
│   │   │   │   └── cost.ts
│   │   │   └── config.ts             # Read .novelrc
│   │   └── package.json
│   │
│   └── dashboard/                    # Web Dashboard (Next.js)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx          # Project list
│       │   │   ├── [project]/
│       │   │   │   ├── page.tsx      # Project overview
│       │   │   │   ├── chapters/     # Chapter list + progress
│       │   │   │   ├── memory/       # Memory DB visualization
│       │   │   │   ├── characters/   # Character state timeline
│       │   │   │   ├── foreshadow/   # Foreshadow graph
│       │   │   │   ├── emotion/      # Emotion curve editor
│       │   │   │   ├── cost/         # Token usage + cost tracker
│       │   │   │   └── export/       # Export to EPUB/PDF
│       │   │   └── settings/
│       │   │       └── api-keys.tsx  # BYOK configuration
│       │   └── components/
│       │       ├── ui/               # shadcn/ui
│       │       ├── emotion-curve-editor.tsx
│       │       ├── foreshadow-graph.tsx
│       │       ├── chapter-progress.tsx
│       │       └── memory-explorer.tsx
│       └── package.json
│
└── projects/                         # User project data (gitignored)
    └── my-novel/
        ├── .novelrc                  # Project config
        ├── author-dna.json           # Author DNA definition
        ├── novel.db                  # SQLite (memory + chapters)
        └── output/
            ├── chapters/             # Generated chapter markdown
            ├── epub/
            └── pdf/
```

### 3.2 Author DNA Schema

```typescript
interface AuthorDNA {
  // ① Philosophy Statement
  philosophy: {
    coreMessage: string;              // "이 작품이 말하고 싶은 것"
    neverDo: string[];                // "절대 하지 않을 것" list
    readerFeeling: string;            // "마지막 화에서 독자가 느꼈으면 하는 것"
    thematicKeywords: string[];       // Recurring themes
  };

  // ② Character Souls
  characters: CharacterSoul[];

  // ③ Style Profiles
  styleProfiles: StyleProfile[];

  // ④ World Rules
  world: {
    name: string;
    description: string;
    rules: WorldRule[];               // Laws of the world (magic system, tech level, etc.)
    locations: Location[];
    factions?: Faction[];
    timeline: TimelineEvent[];
  };

  // ⑤ Meta
  meta: {
    genre: string;                    // e.g. "philosophical SF"
    targetLength: number;             // Total chapters (100-200)
    chapterWordCount: number;         // Target words per chapter (2000-5000)
    language: "ko" | "en" | "ko+en";
    webNovelPlatform?: "ridi" | "kakao-page" | "naver-series" | "munpia" | null;
  };
}

interface CharacterSoul {
  id: string;
  name: string;
  role: "protagonist" | "antagonist" | "supporting" | "minor";

  // Personality
  personality: {
    bigFive: {                        // OCEAN model
      openness: number;               // 0-100
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    mbti?: string;
    enneagram?: number;
  };

  // Core
  coreDesire: string;                 // What they want most
  coreFear: string;                   // What they fear most
  trauma?: string;                    // Backstory wound
  values: string[];                   // What they believe in
  flaw: string;                       // Fatal flaw

  // Expression
  speechPattern: {
    vocabulary: "formal" | "casual" | "archaic" | "technical" | "slang";
    sentenceLength: "short" | "medium" | "long";
    quirks: string[];                 // Catchphrases, verbal tics
    innerVoice: string;              // How their internal monologue sounds
  };

  // Growth Arc
  growthArc: {
    startState: string;               // Who they are at chapter 1
    endState: string;                 // Who they become
    turningPoints: {
      chapter: number;
      event: string;
      change: string;
    }[];
  };

  // Relationships
  relationships: {
    characterId: string;
    type: "ally" | "rival" | "mentor" | "love" | "enemy" | "family";
    dynamic: string;                  // How they interact
    evolution: string;                // How the relationship changes
  }[];
}

interface StyleProfile {
  sceneType: "battle" | "romance" | "introspection" | "dialogue" |
             "exposition" | "climax" | "aftermath" | "daily-life" | "mystery";
  style: {
    sentenceLength: "staccato" | "flowing" | "mixed";
    pacing: "fast" | "medium" | "slow";
    sensoryFocus: string[];           // Which senses to emphasize
    metaphorDensity: "sparse" | "moderate" | "rich";
    povDistance: "close" | "medium" | "distant";
    toneKeywords: string[];           // e.g. ["tense", "breathless", "raw"]
  };
  sampleText?: string;               // Reference prose the AI should match
}
```

### 3.3 Generation Loop

```typescript
// generator/chapter-generator.ts

async function generateChapter(
  chapterNumber: number,
  project: NovelProject
): Promise<GeneratedChapter> {

  const authorDNA = project.authorDNA;
  const plotArc = project.plotArc;
  const memoryDB = project.memoryDB;

  // ── Step 1: Determine chapter context ──
  const chapterPlan = plotArc.getChapterPlan(chapterNumber);
  const emotionTarget = plotArc.emotionCurve.getTarget(chapterNumber);
  const activeCharacters = chapterPlan.characters;
  const activeForeshadowing = memoryDB.foreshadow.getActive(chapterNumber);

  // ── Step 2: Assemble context for LLM ──
  const context = await assembleContext({
    // Always included (fixed)
    philosophy: authorDNA.philosophy,

    // Chapter-specific
    emotionTarget,                     // "이 회차는 긴장 상승 구간"
    chapterPlan,                       // Scene beats for this chapter
    styleProfile: getStyleForScene(chapterPlan.sceneType),

    // Character state (from Memory DB)
    characterStates: await Promise.all(
      activeCharacters.map(id =>
        memoryDB.character.getCurrentState(id)
      )
    ),

    // Foreshadowing instructions
    foreshadowing: {
      toSeed: activeForeshadowing.filter(f => f.action === "seed"),
      toHint: activeForeshadowing.filter(f => f.action === "hint"),
      toPayoff: activeForeshadowing.filter(f => f.action === "payoff"),
    },

    // Previous chapters context (RAG)
    recentSummaries: await memoryDB.chapter.getRecentSummaries(3),
    relevantMemories: await memoryDB.rag.query(
      chapterPlan.description, 10
    ),

    // World rules
    worldRules: authorDNA.world.rules.filter(r =>
      r.relevantTo.includes(chapterPlan.sceneType)
    ),
  });

  // ── Step 3: Generate prose ──
  // Uses Sonnet-tier model for prose generation
  const rawText = await modelRouter.generate({
    task: "prose",
    prompt: buildProsePrompt(context),
    model: project.config.models.prose,  // e.g. "claude-sonnet-4-6"
  });

  // ── Step 4: Post-process ──
  const processed = postProcess(rawText, {
    targetWordCount: authorDNA.meta.chapterWordCount,
    language: authorDNA.meta.language,
  });

  // ── Step 5: Auto-commit to Memory DB ──
  // Uses Haiku-tier model for extraction
  const extraction = await modelRouter.generate({
    task: "extraction",
    prompt: buildExtractionPrompt(processed.text),
    model: project.config.models.qa,  // e.g. "claude-haiku-4-5"
  });

  await memoryDB.autoCommit({
    chapterNumber,
    text: processed.text,
    characterStateChanges: extraction.characterChanges,
    worldStateChanges: extraction.worldChanges,
    newFacts: extraction.newFacts,
    foreshadowUpdates: extraction.foreshadowUpdates,
    chapterSummary: extraction.summary,
  });

  // ── Step 6: Quality Review ──
  // Uses Haiku-tier model
  const review = await qualityReviewer.review({
    chapter: processed,
    context,
    memoryDB,
  });

  if (review.issues.length > 0 && review.severity === "critical") {
    // Auto-regenerate with issue feedback
    return generateChapter(chapterNumber, project, {
      previousAttempt: processed,
      issues: review.issues,
      retryCount: 1,
    });
  }

  return {
    chapterNumber,
    text: processed.text,
    wordCount: processed.wordCount,
    review,
    tokensUsed: processed.tokensUsed,
    cost: processed.cost,
  };
}
```

### 3.4 Memory DB Schema (SQLite)

```sql
-- Character state tracking
CREATE TABLE character_states (
  id INTEGER PRIMARY KEY,
  character_id TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  physical_state TEXT,          -- "injured left arm", "wearing disguise"
  emotional_state TEXT,         -- "grieving", "determined", "conflicted"
  location TEXT,
  knowledge TEXT,               -- JSON: what the character knows at this point
  relationships_delta TEXT,     -- JSON: relationship changes
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- World state tracking
CREATE TABLE world_states (
  id INTEGER PRIMARY KEY,
  chapter_number INTEGER NOT NULL,
  key TEXT NOT NULL,             -- e.g. "war_status", "season", "political_power"
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chapter summaries
CREATE TABLE chapter_summaries (
  chapter_number INTEGER PRIMARY KEY,
  summary TEXT NOT NULL,
  key_events TEXT,              -- JSON array
  characters_present TEXT,     -- JSON array of character IDs
  word_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vector embeddings for RAG
CREATE TABLE memory_embeddings (
  id INTEGER PRIMARY KEY,
  chapter_number INTEGER,
  content_type TEXT,            -- "summary", "character", "world", "dialogue"
  content TEXT NOT NULL,
  embedding BLOB NOT NULL,     -- sqlite-vec vector
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Foreshadowing tracker
CREATE TABLE foreshadowing (
  id INTEGER PRIMARY KEY,
  seed_id TEXT UNIQUE NOT NULL, -- Unique foreshadow identifier
  description TEXT NOT NULL,    -- What the foreshadow is about
  seed_chapter INTEGER,         -- Chapter where planted
  seed_text TEXT,               -- Actual text used to plant
  hint_chapters TEXT,           -- JSON array of hint chapters
  payoff_chapter INTEGER,       -- Chapter where resolved (NULL if unresolved)
  payoff_text TEXT,
  status TEXT DEFAULT 'seeded', -- seeded | hinted | resolved | abandoned
  importance TEXT DEFAULT 'minor', -- minor | major | critical
  scheduled_payoff INTEGER,    -- Target chapter for payoff
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Emotion curve (designed by author, tracked per chapter)
CREATE TABLE emotion_curve (
  chapter_number INTEGER PRIMARY KEY,
  designed_tension REAL,        -- 0.0 to 1.0 (author's plan)
  actual_tension REAL,          -- 0.0 to 1.0 (measured after generation)
  emotion_tags TEXT,            -- JSON: ["hope", "dread", "revelation"]
  notes TEXT
);
```

### 3.5 MCP Server Tools

```typescript
// tools/init.ts
{
  name: "novel:init",
  description: "Create a new novel project",
  inputSchema: {
    type: "object",
    properties: {
      projectName: { type: "string" },
      authorDNA: { type: "object" },  // Full AuthorDNA schema
    },
    required: ["projectName", "authorDNA"]
  }
}

// tools/plot.ts
{
  name: "novel:plot",
  description: "Generate or modify the plot arc structure",
  inputSchema: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["generate", "modify", "view"] },
      arcs: { type: "array" },        // Optional: predefined arc names
      totalChapters: { type: "number" },
      emotionCurve: { type: "object" } // Optional: custom tension targets
    }
  }
}

// tools/generate.ts
{
  name: "novel:generate",
  description: "Generate chapters",
  inputSchema: {
    type: "object",
    properties: {
      from: { type: "number" },        // Start chapter
      to: { type: "number" },          // End chapter
      mode: { type: "string", enum: ["auto", "semi-auto"] },
      // semi-auto: pause after each chapter for review
    },
    required: ["from", "to"]
  }
}

// tools/memory.ts
{
  name: "novel:memory",
  description: "Query or modify the memory database",
  inputSchema: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["query", "update", "list-characters", "list-foreshadow"] },
      query: { type: "string" },       // Natural language query
      updates: { type: "object" }      // Manual updates
    }
  }
}

// tools/review.ts
{
  name: "novel:review",
  description: "Run quality checks on generated chapters",
  inputSchema: {
    type: "object",
    properties: {
      chapters: { type: "array", items: { type: "number" } },
      checks: {
        type: "array",
        items: {
          type: "string",
          enum: ["consistency", "voice", "foreshadow", "pacing", "repetition"]
        }
      }
    }
  }
}

// tools/cost.ts
{
  name: "novel:cost",
  description: "Estimate or report token costs",
  inputSchema: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["estimate", "report"] },
      chapters: { type: "number" }     // For estimate: how many chapters
    }
  }
}

// tools/export.ts
{
  name: "novel:export",
  description: "Export novel to various formats",
  inputSchema: {
    type: "object",
    properties: {
      format: { type: "string", enum: ["epub", "pdf", "markdown", "webnovel"] },
      chapters: { type: "object", properties: { from: { type: "number" }, to: { type: "number" } } },
      metadata: { type: "object" }     // Title, author, cover image, etc.
    }
  }
}

// tools/status.ts
{
  name: "novel:status",
  description: "Check project status",
  inputSchema: {
    type: "object",
    properties: {
      detail: { type: "string", enum: ["overview", "chapters", "memory", "foreshadow", "cost"] }
    }
  }
}
```

### 3.6 Model Router Configuration

```typescript
// .novelrc
{
  "project": "my-novel",
  "models": {
    "plot": {
      "provider": "anthropic",
      "model": "claude-opus-4-6",
      "description": "Arc design, plot architecture, complex narrative decisions"
    },
    "prose": {
      "provider": "anthropic",
      "model": "claude-sonnet-4-6",
      "description": "Chapter text generation, dialogue, scene writing"
    },
    "qa": {
      "provider": "anthropic",
      "model": "claude-haiku-4-5",
      "description": "Quality review, memory extraction, consistency checks"
    },
    "embedding": {
      "provider": "local",
      "model": "nomic-embed-text",
      "description": "Vector embeddings for RAG (runs locally)"
    }
  },
  "apiKeys": {
    "anthropic": "${ANTHROPIC_API_KEY}",
    "openai": "${OPENAI_API_KEY}",
    "google": "${GOOGLE_API_KEY}"
  },
  "generation": {
    "chapterWordCount": 3000,
    "language": "ko",
    "maxRetries": 2,
    "pauseBetweenChapters": 2000,
    "autoReviewEnabled": true
  }
}
```

### 3.7 Emotion Curve Designer

```typescript
interface EmotionCurve {
  // Predefined curve templates
  templates: {
    "standard-arc": number[];       // Rising → climax → resolution
    "double-climax": number[];      // Two peaks
    "slow-burn": number[];          // Gradual build
    "rollercoaster": number[];      // Frequent ups and downs
    "web-novel": number[];          // Hook every 3-5 chapters (Korean web novel style)
  };

  // Per-chapter tension targets (0.0 - 1.0)
  chapters: {
    number: number;
    tension: number;
    emotion: string[];              // ["hope", "dread", "wonder"]
    note?: string;                  // Author's note for this chapter
  }[];

  // Arc boundaries
  arcs: {
    name: string;
    startChapter: number;
    endChapter: number;
    description: string;
    climaxChapter: number;
  }[];
}
```

---

## 4. Phase 0 Deliverables

| # | Task | Priority |
|---|------|----------|
| 1 | Author DNA schema + validation | P0 |
| 2 | SQLite Memory DB setup (all tables + sqlite-vec) | P0 |
| 3 | Plot Architect (generate arc structure from Author DNA) | P0 |
| 4 | Beat Decomposer (arc → chapter → scene beats) | P0 |
| 5 | Context Assembler (build per-chapter LLM prompt) | P0 |
| 6 | Chapter Generator (main generation loop) | P0 |
| 7 | Memory Auto-Commit (extract & store after each chapter) | P0 |
| 8 | Model Router with BYOK (Anthropic + OpenAI) | P0 |
| 9 | MCP Server (all 8 tools) | P0 |
| 10 | CLI (generate, status, export) | P1 |
| 11 | Foreshadowing Tracker (seed/hint/payoff state machine) | P1 |
| 12 | Emotion Curve system | P1 |
| 13 | Quality Reviewer (consistency + voice + foreshadow) | P1 |
| 14 | Cost Calculator (pre-generation estimate) | P1 |
| 15 | EPUB export | P1 |
| 16 | Web Dashboard (project management + progress) | P2 |
| 17 | Dashboard: Memory DB visualization | P2 |
| 18 | Dashboard: Foreshadow graph | P2 |
| 19 | Dashboard: Emotion curve editor | P2 |
| 20 | PDF export + web novel platform format | P2 |
| 21 | Google/Ollama provider support | P2 |

---

## 5. Korean Web Novel Specifics

- Chapter title format: "제N화: [title]" or "N화 - [title]"
- Chapter length: 3,000-5,000 characters (Korean) per chapter
- Hook structure: cliffhanger every 3-5 chapters (subscription model)
- Genre conventions: 회귀 (regression), 헌터물 (hunter), 무협 (martial arts), etc.
- Reader engagement patterns: fast opening, early power reveal, regular tension spikes
- Platform formats: 리디북스, 카카오페이지, 네이버시리즈, 문피아
- EPUB structure: arc-based chapter grouping with custom cover art support

---

## 6. Connection to 22B Labs Pipeline

```
22B Novel Engine
    ↓ (generated chapters)
blog-writer-blog
    ↓ (summary posts, teasers)
Media-forge
    ↓ (webtoon adaptation, character visuals)
22B Studios Pipeline
    ↓ (animation, audio drama)
the4thpath.com
    ↓ (publication)
```

The novel engine's Author DNA + Memory DB can feed directly into Media-forge's
character consistency system (Clifford rotor-based) for visual adaptation.

---

## 7. Non-Goals (Phase 0)

- Real-time collaborative editing
- Built-in text editor (use external editor or MCP client)
- Image generation for illustrations
- Audio/TTS generation
- Direct platform publishing API
- Multi-language simultaneous generation
- Fine-tuning custom models
