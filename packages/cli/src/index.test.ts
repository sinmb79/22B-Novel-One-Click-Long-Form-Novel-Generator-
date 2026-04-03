import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "./index.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("runCli", () => {
  it("prints available phase 0 commands", async () => {
    const lines = await runCli(["help"]);

    expect(lines.join("\n")).toMatch(/init/);
    expect(lines.join("\n")).toMatch(/generate/);
    expect(lines.join("\n")).toMatch(/memory/);
    expect(lines.join("\n")).toMatch(/review/);
    expect(lines.join("\n")).toMatch(/export/);
    expect(lines.join("\n")).toMatch(/cost/);
    expect(lines.join("\n")).toMatch(/status/);
  });

  it("prints a compact status summary", async () => {
    const lines = await runCli(["status"]);

    expect(lines.join("\n")).toMatch(/phase 0 foundation/i);
  });

  it("initializes a project from a BOM-prefixed author dna json file", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-cli-"));
    tempDirectories.push(rootDirectory);

    const authorDnaPath = join(rootDirectory, "author-dna.json");
    const authorDna = {
      philosophy: {
        coreMessage: "Power reveals the hidden self.",
        neverDo: ["Romanticize cruelty"],
        readerFeeling: "Uneasy curiosity",
        thematicKeywords: ["memory"],
      },
      characters: [
        {
          id: "hero",
          name: "Seo Yoon",
          role: "protagonist",
          personality: {
            bigFive: {
              openness: 80,
              conscientiousness: 70,
              extraversion: 40,
              agreeableness: 60,
              neuroticism: 50,
            },
          },
          coreDesire: "Find the sealed vault.",
          coreFear: "Losing herself.",
          values: ["truth"],
          flaw: "Withdraws under pressure.",
          speechPattern: {
            vocabulary: "formal",
            sentenceLength: "medium",
            quirks: ["pauses before answering"],
            innerVoice: "Measured and tense.",
          },
          growthArc: {
            startState: "Guarded",
            endState: "Open",
            turningPoints: [],
          },
          relationships: [],
        },
      ],
      styleProfiles: [
        {
          sceneType: "introspection",
          style: {
            sentenceLength: "flowing",
            pacing: "slow",
            sensoryFocus: ["sound"],
            metaphorDensity: "moderate",
            povDistance: "close",
            toneKeywords: ["haunting"],
          },
        },
      ],
      world: {
        name: "Archive Sea",
        description: "A flooded city.",
        rules: [
          {
            id: "memory-trade",
            name: "Memory Trade",
            description: "Memories can be extracted.",
            relevantTo: ["introspection"],
          },
        ],
        locations: [
          {
            id: "lower-harbor",
            name: "Lower Harbor",
            description: "Rust markets over black water.",
          },
        ],
        timeline: [
          {
            chapter: 1,
            event: "A vault pulse disturbs the harbor.",
          },
        ],
      },
      meta: {
        genre: "sf",
        targetLength: 2,
        chapterWordCount: 1500,
        language: "ko",
        webNovelPlatform: "munpia",
      },
    };

    await writeFile(authorDnaPath, `\uFEFF\uFEFF${JSON.stringify(authorDna, null, 2)}`, "utf8");

    const lines = await runCli(["init", rootDirectory, "bom-novel", authorDnaPath]);

    expect(lines.join("\n")).toMatch(/Project created:/);
  });

  it("uses the runtime router when generate is executed", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-cli-"));
    tempDirectories.push(rootDirectory);

    const authorDnaPath = join(rootDirectory, "author-dna.json");
    await writeFile(
      authorDnaPath,
      JSON.stringify({
        philosophy: {
          coreMessage: "Power reveals the hidden self.",
          neverDo: ["Romanticize cruelty"],
          readerFeeling: "Uneasy curiosity",
          thematicKeywords: ["memory"],
        },
        characters: [
          {
            id: "hero",
            name: "Seo Yoon",
            role: "protagonist",
            personality: {
              bigFive: {
                openness: 80,
                conscientiousness: 70,
                extraversion: 40,
                agreeableness: 60,
                neuroticism: 50,
              },
            },
            coreDesire: "Find the sealed vault.",
            coreFear: "Losing herself.",
            values: ["truth"],
            flaw: "Withdraws under pressure.",
            speechPattern: {
              vocabulary: "formal",
              sentenceLength: "medium",
              quirks: ["pauses before answering"],
              innerVoice: "Measured and tense.",
            },
            growthArc: {
              startState: "Guarded",
              endState: "Open",
              turningPoints: [],
            },
            relationships: [],
          },
        ],
        styleProfiles: [
          {
            sceneType: "introspection",
            style: {
              sentenceLength: "flowing",
              pacing: "slow",
              sensoryFocus: ["sound"],
              metaphorDensity: "moderate",
              povDistance: "close",
              toneKeywords: ["haunting"],
            },
          },
        ],
        world: {
          name: "Archive Sea",
          description: "A flooded city.",
          rules: [
            {
              id: "memory-trade",
              name: "Memory Trade",
              description: "Memories can be extracted.",
              relevantTo: ["introspection"],
            },
          ],
          locations: [
            {
              id: "lower-harbor",
              name: "Lower Harbor",
              description: "Rust markets over black water.",
            },
          ],
          timeline: [
            {
              chapter: 1,
              event: "A vault pulse disturbs the harbor.",
            },
          ],
        },
        meta: {
          genre: "sf",
          targetLength: 2,
          chapterWordCount: 1500,
          language: "ko",
          webNovelPlatform: "munpia",
        },
      }),
      "utf8",
    );

    const initLines = await runCli(["init", rootDirectory, "runtime-router-novel", authorDnaPath]);
    expect(initLines.join("\n")).toMatch(/Project created:/);

    const originalProvider = process.env.NOVEL_PROVIDER;
    const originalModel = process.env.NOVEL_MODEL_PROSE;

    process.env.NOVEL_PROVIDER = "stub";
    process.env.NOVEL_MODEL_PROSE = "runtime-prose";

    try {
      await runCli([
        "generate",
        join(rootDirectory, "runtime-router-novel"),
        "1",
        "1",
      ]);
    } finally {
      process.env.NOVEL_PROVIDER = originalProvider;
      process.env.NOVEL_MODEL_PROSE = originalModel;
    }

    const chapterText = await readFile(
      join(rootDirectory, "runtime-router-novel", "output", "chapters", "001.md"),
      "utf8",
    );

    expect(chapterText).toContain("[runtime-prose]");
  });

  it("exports a requested non-markdown format", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-cli-"));
    tempDirectories.push(rootDirectory);

    const authorDnaPath = join(rootDirectory, "author-dna.json");
    await writeFile(
      authorDnaPath,
      JSON.stringify({
        philosophy: {
          coreMessage: "Power reveals the hidden self.",
          neverDo: ["Romanticize cruelty"],
          readerFeeling: "Uneasy curiosity",
          thematicKeywords: ["memory"],
        },
        characters: [
          {
            id: "hero",
            name: "Seo Yoon",
            role: "protagonist",
            personality: {
              bigFive: {
                openness: 80,
                conscientiousness: 70,
                extraversion: 40,
                agreeableness: 60,
                neuroticism: 50,
              },
            },
            coreDesire: "Find the sealed vault.",
            coreFear: "Losing herself.",
            values: ["truth"],
            flaw: "Withdraws under pressure.",
            speechPattern: {
              vocabulary: "formal",
              sentenceLength: "medium",
              quirks: ["pauses before answering"],
              innerVoice: "Measured and tense.",
            },
            growthArc: {
              startState: "Guarded",
              endState: "Open",
              turningPoints: [],
            },
            relationships: [],
          },
        ],
        styleProfiles: [
          {
            sceneType: "introspection",
            style: {
              sentenceLength: "flowing",
              pacing: "slow",
              sensoryFocus: ["sound"],
              metaphorDensity: "moderate",
              povDistance: "close",
              toneKeywords: ["haunting"],
            },
          },
        ],
        world: {
          name: "Archive Sea",
          description: "A flooded city.",
          rules: [
            {
              id: "memory-trade",
              name: "Memory Trade",
              description: "Memories can be extracted.",
              relevantTo: ["introspection"],
            },
          ],
          locations: [
            {
              id: "lower-harbor",
              name: "Lower Harbor",
              description: "Rust markets over black water.",
            },
          ],
          timeline: [
            {
              chapter: 1,
              event: "A vault pulse disturbs the harbor.",
            },
          ],
        },
        meta: {
          genre: "sf",
          targetLength: 2,
          chapterWordCount: 1500,
          language: "ko",
          webNovelPlatform: "munpia",
        },
      }),
      "utf8",
    );

    await runCli(["init", rootDirectory, "export-format-novel", authorDnaPath]);
    await runCli([
      "generate",
      join(rootDirectory, "export-format-novel"),
      "1",
      "1",
    ]);

    const lines = await runCli([
      "export",
      join(rootDirectory, "export-format-novel"),
      "1",
      "1",
      "Export",
      "Novel",
      "--format",
      "json",
    ]);

    expect(lines.join("\n")).toMatch(/\.json$/);
  });
});
