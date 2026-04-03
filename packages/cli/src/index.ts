import { readFile } from "node:fs/promises";

import {
  createRuntimeModelRouter,
  createNovelProject,
  engineVersion,
  estimateGenerationCost,
  exportProject,
  exportProjectAsMarkdown,
  generateChapterRange,
  parseAuthorDNA,
  queryProjectMemory,
  reviewGeneratedChapters,
} from "@22b/engine";

async function readJsonFile(path: string): Promise<unknown> {
  const text = await readFile(path, "utf8");
  return JSON.parse(text.replace(/^\uFEFF+/, ""));
}

export async function runCli(args: string[]): Promise<string[]> {
  const [command, ...rest] = args;

  if (!command || command === "help") {
    return [
      "22B Novel Phase 0 CLI",
      "Commands:",
      "  init <rootDir> <projectName> <authorDnaPath>",
      "  generate <projectDirectory> <from> <to>",
      "  memory <projectDirectory> <query>",
      "  review <projectDirectory> <chapterCsv>",
      "  export <projectDirectory> <from> <to> <title>",
      "  cost <chapters> [chapterWordCount]",
      "  status",
    ];
  }

  if (command === "status") {
    return [
      "22B Novel phase 0 foundation",
      `Engine version: ${engineVersion}`,
      "Available commands: init, generate, memory, review, export, cost, status",
    ];
  }

  if (command === "init") {
    const [rootDirectory, projectName, authorDnaPath] = rest;

    if (!rootDirectory || !projectName || !authorDnaPath) {
      return ["Usage: init <rootDir> <projectName> <authorDnaPath>"];
    }

    const authorDNA = parseAuthorDNA(await readJsonFile(authorDnaPath));
    const project = await createNovelProject({
      rootDirectory,
      projectName,
      authorDNA,
    });

    return [`Project created: ${project.projectDirectory}`];
  }

  if (command === "generate") {
    const [projectDirectory, from, to] = rest;

    if (!projectDirectory || !from || !to) {
      return ["Usage: generate <projectDirectory> <from> <to>"];
    }

    const result = await generateChapterRange({
      projectDirectory,
      from: Number(from),
      to: Number(to),
      router: createRuntimeModelRouter(),
    });

    return result.generatedChapters.map(
      (chapter) => `Generated chapter ${chapter.chapterNumber}: ${chapter.outputPath}`,
    );
  }

  if (command === "memory") {
    const [projectDirectory, ...queryParts] = rest;

    if (!projectDirectory) {
      return ["Usage: memory <projectDirectory> <query>"];
    }

    const query = queryParts.join(" ").trim();
    const result = await queryProjectMemory({
      projectDirectory,
      action: query ? "query" : "list-characters",
      query: query || undefined,
    });

    return [JSON.stringify(result, null, 2)];
  }

  if (command === "review") {
    const [projectDirectory, chapterCsv] = rest;

    if (!projectDirectory || !chapterCsv) {
      return ["Usage: review <projectDirectory> <chapterCsv>"];
    }

    const chapters = chapterCsv.split(",").map((value) => Number(value.trim()));
    const result = await reviewGeneratedChapters({
      projectDirectory,
      chapters,
    });

    return [JSON.stringify(result, null, 2)];
  }

  if (command === "export") {
    const [projectDirectory, from, to, ...rawTitleParts] = rest;
    const formatFlagIndex = rawTitleParts.findIndex((part) => part === "--format");
    const titleParts =
      formatFlagIndex >= 0 ? rawTitleParts.slice(0, formatFlagIndex) : rawTitleParts;
    const format =
      formatFlagIndex >= 0 ? rawTitleParts[formatFlagIndex + 1] : "markdown";

    if (!projectDirectory || !from || !to || titleParts.length === 0 || !format) {
      return ["Usage: export <projectDirectory> <from> <to> <title> [--format <format>]"];
    }

    const result =
      format === "markdown"
        ? await exportProjectAsMarkdown({
            projectDirectory,
            from: Number(from),
            to: Number(to),
            title: titleParts.join(" "),
          })
        : await exportProject({
            projectDirectory,
            from: Number(from),
            to: Number(to),
            title: titleParts.join(" "),
            format: format as "txt" | "json" | "epub" | "pdf" | "markdown",
          });

    return [`Exported ${format}: ${result.outputPath}`];
  }

  if (command === "cost") {
    const [chaptersText, chapterWordCountText] = rest;

    if (!chaptersText) {
      return ["Usage: cost <chapters> [chapterWordCount]"];
    }

    const estimate = estimateGenerationCost({
      chapters: Number(chaptersText),
      chapterWordCount: chapterWordCountText ? Number(chapterWordCountText) : 3000,
      models: {
        plot: {
          inputCostPer1kTokens: 0.015,
          outputCostPer1kTokens: 0.075,
        },
        prose: {
          inputCostPer1kTokens: 0.003,
          outputCostPer1kTokens: 0.015,
        },
        qa: {
          inputCostPer1kTokens: 0.0008,
          outputCostPer1kTokens: 0.004,
        },
      },
    });

    return [JSON.stringify(estimate, null, 2)];
  }

  return [`Unknown command: ${command}`, "Run `help` to see available commands."];
}

async function main(): Promise<void> {
  const lines = await runCli(process.argv.slice(2));
  process.stdout.write(`${lines.join("\n")}\n`);
}

const executedPath = process.argv[1] ?? "";
if (import.meta.url === new URL(`file://${executedPath}`).href) {
  void main();
}
