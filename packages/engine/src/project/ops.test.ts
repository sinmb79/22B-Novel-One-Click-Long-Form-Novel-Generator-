import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { createSampleAuthorDNA } from "../test/fixtures.js";
import {
  createNovelProject,
  exportProjectAsMarkdown,
  generateChapterRange,
  queryProjectMemory,
  reviewGeneratedChapters,
} from "./project.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("project ops", () => {
  it("queries generated memory state from the project database", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-novel-"));
    tempDirectories.push(rootDirectory);

    const project = await createNovelProject({
      rootDirectory,
      projectName: "memory-novel",
      authorDNA: createSampleAuthorDNA(),
    });

    await generateChapterRange({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 1,
      router: {
        generate: async () => ({
          text: "Seo Yoon enters the lower harbor and hears the archive hum.",
          tokensUsed: 100,
        }),
      },
    });

    const memory = await queryProjectMemory({
      projectDirectory: project.projectDirectory,
      action: "query",
      query: "archive hum",
    });

    expect(memory.summaries).toHaveLength(1);
    expect(memory.characters).toContain("Seo Yoon");
  });

  it("reviews generated chapters and exports a combined markdown file", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-novel-"));
    tempDirectories.push(rootDirectory);

    const project = await createNovelProject({
      rootDirectory,
      projectName: "review-novel",
      authorDNA: createSampleAuthorDNA(),
    });

    await generateChapterRange({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      router: {
        generate: async ({ prompt }) => ({
          text: `Generated prose from prompt: ${prompt.slice(0, 120)}`,
          tokensUsed: 100,
        }),
      },
    });

    const review = await reviewGeneratedChapters({
      projectDirectory: project.projectDirectory,
      chapters: [1, 2],
    });
    const exported = await exportProjectAsMarkdown({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      title: "Review Novel",
    });

    const exportedText = await readFile(exported.outputPath, "utf8");

    expect(review.issues.length).toBeGreaterThan(0);
    expect(exportedText).toContain("# Review Novel");
    expect(exportedText).toContain("## Chapter 1");
    expect(exportedText).toContain("## Chapter 2");
  });
});
