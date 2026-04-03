import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import {
  createNovelProject,
  exportProject,
  generateChapterRange,
} from "../../../engine/src/index.js";
import { createSampleAuthorDNA } from "../../../engine/src/test/fixtures.js";
import { discoverNovelProjects, readNovelProjectDetail } from "./dashboard-data.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("dashboard data", () => {
  it("discovers initialized novel projects inside a root directory", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-dashboard-"));
    tempDirectories.push(rootDirectory);

    const project = await createNovelProject({
      rootDirectory,
      projectName: "dashboard-novel",
      authorDNA: createSampleAuthorDNA(),
    });

    await generateChapterRange({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 1,
      router: {
        generate: async ({ task }) => ({
          text: `Generated(${task}) Seo Yoon studies the harbor gate.`,
          tokensUsed: 100,
        }),
      },
    });
    await exportProject({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 1,
      title: "Dashboard Novel",
      format: "json",
    });

    const projects = await discoverNovelProjects(rootDirectory);

    expect(projects).toEqual([
      expect.objectContaining({
        name: "dashboard-novel",
        chapterCount: 1,
        exportCount: 1,
      }),
    ]);
  });

  it("reads chapter previews and export filenames for a single project", async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), "22b-dashboard-"));
    tempDirectories.push(rootDirectory);

    const project = await createNovelProject({
      rootDirectory,
      projectName: "dashboard-detail",
      authorDNA: createSampleAuthorDNA(),
    });

    await generateChapterRange({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      router: {
        generate: async ({ task }) => ({
          text: `Generated(${task}) Seo Yoon studies the harbor gate and hears the archive sea breathing through steel.`,
          tokensUsed: 100,
        }),
      },
    });
    await exportProject({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: 2,
      title: "Dashboard Detail",
      format: "pdf",
    });

    const detail = await readNovelProjectDetail(project.projectDirectory);

    expect(detail.chapters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chapterNumber: 1,
          preview: expect.stringContaining("Seo Yoon"),
        }),
        expect.objectContaining({
          chapterNumber: 2,
        }),
      ]),
    );
    expect(detail.exports).toEqual(expect.arrayContaining(["novel.pdf"]));
  });
});
