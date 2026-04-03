import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createSampleAuthorDNA } from "../test/fixtures.js";
import { createNovelProject, generateChapterRange } from "./project.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("project workflow", () => {
  it("creates a project workspace with config, author dna, and database", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-novel-"));
    tempDirectories.push(rootDirectory);

    const project = await createNovelProject({
      rootDirectory,
      projectName: "demo-novel",
      authorDNA: createSampleAuthorDNA(),
    });

    const configText = await readFile(join(project.projectDirectory, ".novelrc.json"), "utf8");
    const authorDnaText = await readFile(join(project.projectDirectory, "author-dna.json"), "utf8");

    await expect(stat(join(project.projectDirectory, "novel.db"))).resolves.toBeDefined();
    expect(configText).toContain('"projectName": "demo-novel"');
    expect(authorDnaText).toContain('"Seo Yoon"');
  });

  it("generates chapter files into the project output directory", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-novel-"));
    tempDirectories.push(rootDirectory);

    const project = await createNovelProject({
      rootDirectory,
      projectName: "generated-novel",
      authorDNA: createSampleAuthorDNA(),
    });

    const router = {
      generate: vi.fn(async ({ task, prompt }: { task: string; prompt: string }) => ({
        text: `Generated(${task}): ${prompt.slice(0, 60)}`,
        tokensUsed: 256,
      })),
    };

    const result = await generateChapterRange({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      router,
    });

    const chapter1 = await readFile(
      join(project.projectDirectory, "output", "chapters", "001.md"),
      "utf8",
    );
    const chapter2 = await readFile(
      join(project.projectDirectory, "output", "chapters", "002.md"),
      "utf8",
    );

    expect(result.generatedChapters).toHaveLength(2);
    expect(chapter1).toContain("Generated(prose)");
    expect(chapter2).toContain("Generated(prose)");
    expect(router.generate).toHaveBeenCalledTimes(2);
  });
});
