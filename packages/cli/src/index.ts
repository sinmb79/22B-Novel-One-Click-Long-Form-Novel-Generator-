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
import { runQuickBook } from "@22b/quickbook";

function parseLongOptions(args: string[]): {
  options: Record<string, string[]>;
  positionals: string[];
} {
  const options: Record<string, string[]> = {};
  const positionals: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index]!;

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const key = token.slice(2);
    const values: string[] = [];

    while (index + 1 < args.length && !args[index + 1]!.startsWith("--")) {
      values.push(args[index + 1]!);
      index += 1;
    }

    options[key] = values.length > 0 ? values : ["true"];
  }

  return { options, positionals };
}

function parseList(values: string[] | undefined, fallback: string[] = []): string[] {
  return (values ?? fallback)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

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
      "  quickbook --topic <topic> [--genre <genre>] [--chapters <n>]",
      "  status",
    ];
  }

  if (command === "status") {
    return [
      "22B Novel phase 0 foundation",
      `Engine version: ${engineVersion}`,
      "Available commands: init, generate, memory, review, export, cost, quickbook, status",
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

  if (command === "quickbook") {
    const { options } = parseLongOptions(rest);
    const topic = options.topic?.join(" ").trim();

    if (!topic) {
      return [
        "Usage: quickbook --topic <topic> [--genre <genre>] [--chapters <n>] [--style <style>] [--ref <pathOrUrl...>] [--lang <lang>] [--format <format...>] [--output <path>]",
      ];
    }

    const references = parseList(options.ref).map((value) => ({
      type: value.startsWith("http://") || value.startsWith("https://") ? "url" : "file",
      value,
    })) as Array<{ type: "url" | "file"; value: string }>;

    const result = await runQuickBook({
      topic,
      genre: options.genre?.join(" "),
      chapters: options.chapters?.[0] ? Number(options.chapters[0]) : undefined,
      style: options.style?.join(" ") ?? "웹소설체",
      references,
      language: options.lang?.[0] === "en" ? "en" : "ko",
      format: parseList(options.format, ["epub"]) as Array<"epub" | "pdf">,
      outputPath: options.output?.join(" "),
    });

    return [
      "QuickBook complete!",
      `주제: ${topic}`,
      `총 분량: ${result.stats.totalChapters}화 / ${result.stats.totalWords} words`,
      `총 비용: $${result.stats.totalCost.toFixed(2)}`,
      ...result.outputFiles.map((file) => `${file.format.toUpperCase()}: ${file.path}`),
    ];
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
