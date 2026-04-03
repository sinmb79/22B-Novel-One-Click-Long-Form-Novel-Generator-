import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { parseAuthorDNA } from "../author-dna/manager.js";
import type { AuthorDNA } from "../author-dna/types.js";
import { exportArtifact } from "../export/exporter.js";
import { generateChapter } from "../generator/chapter-generator.js";
import { autoCommitChapter } from "../memory/auto-commit.js";
import { createNovelMemoryDatabase } from "../memory/db.js";
import type { ChapterGeneratorRouter } from "../generator/chapter-generator.js";
import { buildPlotArchitecture } from "../plot/architect.js";
import { reviewChapter } from "../quality/reviewer.js";
import type { PlotArchitecture } from "../plot/types.js";
import type { ExportFormat } from "../export/types.js";

export interface CreateNovelProjectInput {
  rootDirectory: string;
  projectName: string;
  authorDNA: AuthorDNA;
}

export interface NovelProjectInfo {
  projectDirectory: string;
  configPath: string;
  authorDnaPath: string;
  databasePath: string;
}

export interface GenerateChapterRangeInput {
  projectDirectory: string;
  from: number;
  to: number;
  router: ChapterGeneratorRouter;
}

export interface GenerateChapterRangeResult {
  generatedChapters: Array<{
    chapterNumber: number;
    outputPath: string;
    tokensUsed: number;
  }>;
}

export interface QueryProjectMemoryInput {
  projectDirectory: string;
  action: "query" | "list-characters" | "list-foreshadow";
  query?: string;
}

export interface QueryProjectMemoryResult {
  characters: string[];
  summaries: string[];
  foreshadowing: Array<{ seedId: string; status: string; description: string }>;
}

export interface ReviewGeneratedChaptersInput {
  projectDirectory: string;
  chapters: number[];
}

export interface ReviewGeneratedChaptersResult {
  issues: Array<{
    chapterNumber: number;
    severity: "warning" | "critical";
    rule: "length" | "consistency" | "voice" | "foreshadow" | "missing-file";
    message: string;
  }>;
}

export interface ExportProjectAsMarkdownInput {
  projectDirectory: string;
  from: number;
  to: number;
  title: string;
}

export interface ExportProjectAsMarkdownResult {
  outputPath: string;
}

export interface ExportProjectInput extends ExportProjectAsMarkdownInput {
  format: ExportFormat;
}

export interface ExportProjectResult extends ExportProjectAsMarkdownResult {
  format: ExportFormat;
}

interface NovelProjectConfig {
  projectName: string;
  chapterWordCount: number;
  language: AuthorDNA["meta"]["language"];
}

function getProjectPaths(projectDirectory: string) {
  return {
    configPath: join(projectDirectory, ".novelrc.json"),
    authorDnaPath: join(projectDirectory, "author-dna.json"),
    databasePath: join(projectDirectory, "novel.db"),
    plotPath: join(projectDirectory, "plot.json"),
    outputDirectory: join(projectDirectory, "output"),
    chaptersDirectory: join(projectDirectory, "output", "chapters"),
    exportsDirectory: join(projectDirectory, "output", "exports"),
  };
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readJson<T>(path: string): Promise<T> {
  const text = await readFile(path, "utf8");
  return JSON.parse(text.replace(/^\uFEFF+/, "")) as T;
}

function summarizeText(text: string): string {
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0]?.trim();
  return firstSentence && firstSentence.length > 0
    ? firstSentence
    : text.trim().slice(0, 180);
}

export async function createNovelProject({
  rootDirectory,
  projectName,
  authorDNA,
}: CreateNovelProjectInput): Promise<NovelProjectInfo> {
  const projectDirectory = join(rootDirectory, projectName);
  const paths = getProjectPaths(projectDirectory);

  await mkdir(paths.chaptersDirectory, { recursive: true });
  await mkdir(paths.exportsDirectory, { recursive: true });

  const config: NovelProjectConfig = {
    projectName,
    chapterWordCount: authorDNA.meta.chapterWordCount,
    language: authorDNA.meta.language,
  };

  await writeJson(paths.configPath, config);
  await writeJson(paths.authorDnaPath, authorDNA);

  const db = createNovelMemoryDatabase(paths.databasePath, { projectName });
  db.close();

  return {
    projectDirectory,
    configPath: paths.configPath,
    authorDnaPath: paths.authorDnaPath,
    databasePath: paths.databasePath,
  };
}

export async function queryProjectMemory({
  projectDirectory,
  action,
  query,
}: QueryProjectMemoryInput): Promise<QueryProjectMemoryResult> {
  const { authorDNA, paths } = await loadProject(projectDirectory);
  const db = createNovelMemoryDatabase(paths.databasePath);

  try {
    const characters = authorDNA.characters.map((character) => character.name);
    const summaries =
      action === "query" && query
        ? (
            db
              .prepare(
                `
                SELECT summary
                FROM chapter_summaries
                WHERE summary LIKE ?
                ORDER BY chapter_number
                `,
              )
              .all(`%${query}%`) as Array<{ summary: string }>
          ).map((row) => row.summary)
        : [];

    const foreshadowing =
      action === "list-foreshadow" || action === "query"
        ? (
            db
              .prepare(
                `
                SELECT seed_id, status, description
                FROM foreshadowing
                ORDER BY seed_chapter, seed_id
                `,
              )
              .all() as Array<{ seed_id: string; status: string; description: string }>
          ).map((row) => ({
            seedId: row.seed_id,
            status: row.status,
            description: row.description,
          }))
        : [];

    return {
      characters,
      summaries,
      foreshadowing,
    };
  } finally {
    db.close();
  }
}

export async function reviewGeneratedChapters({
  projectDirectory,
  chapters,
}: ReviewGeneratedChaptersInput): Promise<ReviewGeneratedChaptersResult> {
  const { authorDNA, config, paths } = await loadProject(projectDirectory);
  const db = createNovelMemoryDatabase(paths.databasePath);
  const issues: ReviewGeneratedChaptersResult["issues"] = [];

  try {
    for (const chapterNumber of chapters) {
      const chapterPath = join(paths.chaptersDirectory, `${String(chapterNumber).padStart(3, "0")}.md`);

      try {
        const text = await readFile(chapterPath, "utf8");
        const result = reviewChapter({
          chapterNumber,
          text,
          authorDNA,
          chapterWordCountTarget: config.chapterWordCount,
          db,
        });
        issues.push(...result.issues);
      } catch {
        issues.push({
          chapterNumber,
          severity: "critical",
          rule: "missing-file",
          message: `Chapter ${chapterNumber} file is missing.`,
        });
      }
    }
  } finally {
    db.close();
  }

  return { issues };
}

export async function exportProjectAsMarkdown({
  projectDirectory,
  from,
  to,
  title,
}: ExportProjectAsMarkdownInput): Promise<ExportProjectAsMarkdownResult> {
  const result = await exportProject({
    projectDirectory,
    from,
    to,
    title,
    format: "markdown",
  });

  return {
    outputPath: result.outputPath,
  };
}

export async function exportProject({
  projectDirectory,
  from,
  to,
  title,
  format,
}: ExportProjectInput): Promise<ExportProjectResult> {
  const { paths } = await loadProject(projectDirectory);
  const chapters: Array<{ chapterNumber: number; title: string; body: string }> = [];

  for (let chapterNumber = from; chapterNumber <= to; chapterNumber += 1) {
    const chapterPath = join(paths.chaptersDirectory, `${String(chapterNumber).padStart(3, "0")}.md`);
    const text = await readFile(chapterPath, "utf8");
    const normalized = text.replace(/^#\s+Chapter\s+\d+\s*/i, "").trim();
    chapters.push({
      chapterNumber,
      title: `Chapter ${chapterNumber}`,
      body: normalized,
    });
  }
  return exportArtifact({
    title,
    chapters,
    exportsDirectory: paths.exportsDirectory,
    format,
  });
}

async function loadProject(projectDirectory: string): Promise<{
  authorDNA: AuthorDNA;
  config: NovelProjectConfig;
  plot: PlotArchitecture;
  paths: ReturnType<typeof getProjectPaths>;
}> {
  const paths = getProjectPaths(projectDirectory);
  const authorDNA = parseAuthorDNA(await readJson<unknown>(paths.authorDnaPath));
  const config = await readJson<NovelProjectConfig>(paths.configPath);
  const plot = buildPlotArchitecture(authorDNA);

  await writeJson(paths.plotPath, plot);

  return {
    authorDNA,
    config,
    plot,
    paths,
  };
}

export async function generateChapterRange({
  projectDirectory,
  from,
  to,
  router,
}: GenerateChapterRangeInput): Promise<GenerateChapterRangeResult> {
  const { authorDNA, plot, paths } = await loadProject(projectDirectory);
  const db = createNovelMemoryDatabase(paths.databasePath);

  try {
    const generatedChapters: GenerateChapterRangeResult["generatedChapters"] = [];

    for (let chapterNumber = from; chapterNumber <= to; chapterNumber += 1) {
      const generated = await generateChapter({
        authorDNA,
        plot,
        chapterNumber,
        router,
        characterStates: [],
        foreshadowing: {
          toSeed: [],
          toHint: [],
          toPayoff: [],
        },
        recentSummaries: [],
        relevantMemories: [],
      });

      const outputPath = join(paths.chaptersDirectory, `${String(chapterNumber).padStart(3, "0")}.md`);
      const markdown = `# Chapter ${chapterNumber}\n\n${generated.text}\n`;

      await writeFile(outputPath, markdown, "utf8");

      autoCommitChapter(db, {
        chapterNumber,
        text: generated.text,
        chapterSummary: summarizeText(generated.text),
        keyEvents: generated.beats.map((beat) => beat.summary),
        charactersPresent: generated.context.chapterPlan.characters,
        characterStateChanges: [],
        worldStateChanges: [],
        foreshadowUpdates: [],
      });

      generatedChapters.push({
        chapterNumber,
        outputPath,
        tokensUsed: generated.tokensUsed,
      });
    }

    return { generatedChapters };
  } finally {
    db.close();
  }
}
