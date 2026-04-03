import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { createSampleAuthorDNA } from "../test/fixtures.js";
import { createNovelProject, exportProject, generateChapterRange } from "../project/project.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("exportProject", () => {
  it("exports markdown, txt, json, epub, and pdf artifacts", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-export-"));
    tempDirectories.push(rootDirectory);

    const project = await createNovelProject({
      rootDirectory,
      projectName: "export-novel",
      authorDNA: createSampleAuthorDNA(),
    });

    await generateChapterRange({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      router: {
        generate: async ({ task }) => ({
          text: `Generated(${task}) Seo Yoon studies the tidewall and keeps moving forward.`,
          tokensUsed: 256,
        }),
      },
    });

    const markdown = await exportProject({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      title: "Export Novel",
      format: "markdown",
    });
    const txt = await exportProject({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      title: "Export Novel",
      format: "txt",
    });
    const json = await exportProject({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      title: "Export Novel",
      format: "json",
    });
    const epub = await exportProject({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      title: "Export Novel",
      format: "epub",
    });
    const pdf = await exportProject({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      title: "Export Novel",
      format: "pdf",
    });

    const markdownText = await readFile(markdown.outputPath, "utf8");
    const txtText = await readFile(txt.outputPath, "utf8");
    const jsonText = await readFile(json.outputPath, "utf8");
    const pdfBytes = await readFile(pdf.outputPath);

    await expect(stat(epub.outputPath)).resolves.toBeDefined();
    expect(markdownText).toContain("# Export Novel");
    expect(txtText).toContain("Chapter 1");
    expect(JSON.parse(jsonText)).toMatchObject({
      title: "Export Novel",
      chapters: expect.arrayContaining([
        expect.objectContaining({ chapterNumber: 1 }),
        expect.objectContaining({ chapterNumber: 2 }),
      ]),
    });
    expect(pdfBytes.subarray(0, 4).toString("utf8")).toBe("%PDF");
  });
});
