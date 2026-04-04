import { mkdtemp, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { runQuickBook } from "./index.js";
import {
  createFallbackQuickBookRouter,
  createQuickBookTestRouter,
} from "./test/fixtures.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("runQuickBook", () => {
  it("creates a project and exports an epub from topic-driven input", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-quickbook-"));
    tempDirectories.push(rootDirectory);
    const progressEvents: string[] = [];

    const result = await runQuickBook(
      {
        topic: "조선시대 궁녀의 생존기",
        genre: "로맨스사극",
        chapters: 2,
        style: "웹소설체",
        references: [
          {
            type: "text",
            value: "궁녀는 엄격한 위계와 일상 노동 속에서 살아남아야 했다.",
          },
        ],
        format: ["epub"],
      },
      (progress) => {
        progressEvents.push(`${progress.stage}:${progress.percent}`);
      },
      {
        rootDirectory,
        router: createQuickBookTestRouter(),
      },
    );

    expect(progressEvents.some((event) => event.startsWith("reference:"))).toBe(true);
    expect(progressEvents.some((event) => event.startsWith("generation:"))).toBe(true);
    expect(result.success).toBe(true);
    expect(result.outputFiles).toHaveLength(1);
    expect(result.outputFiles[0]?.format).toBe("epub");
    expect(result.stats.totalChapters).toBe(2);
    expect(result.stats.charactersCreated).toBeGreaterThan(0);
    expect(result.stats.totalWords).toBeGreaterThan(0);
    await expect(stat(result.outputFiles[0]!.path)).resolves.toBeDefined();
  });

  it("falls back to deterministic DNA generation when the model does not return valid json", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-quickbook-"));
    tempDirectories.push(rootDirectory);

    const result = await runQuickBook(
      {
        topic: "기억을 거래하는 항구 도시의 생존담",
        chapters: 2,
        format: ["epub"],
      },
      () => undefined,
      {
        rootDirectory,
        router: createFallbackQuickBookRouter(),
      },
    );

    expect(result.success).toBe(true);
    expect(result.stats.charactersCreated).toBeGreaterThanOrEqual(3);
  });
});
