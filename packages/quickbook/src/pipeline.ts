import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, parse, resolve } from "node:path";

import {
  createNovelMemoryDatabase,
  createNovelProject,
  createRuntimeModelRouter,
  exportProject,
} from "@22b/engine";

import { generateAuthorDNA, inferGenre } from "./auto-dna/generator.js";
import { prepareQuickBookPlot } from "./auto-plot/orchestrator.js";
import { createUsageTracker, estimateQuickBookCost } from "./batch/cost-tracker.js";
import { createStageProgress } from "./batch/progress.js";
import { runBatchGeneration } from "./batch/runner.js";
import { processReferences } from "./reference/processor.js";

import type { QuickBookFormat, QuickBookProgress, QuickBookRequest, QuickBookResult, QuickBookRunOptions } from "./types.js";

function sanitizeFilename(value: string): string {
  const sanitized = value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

  return sanitized.length > 0 ? sanitized : "quickbook-project";
}

function resolveProjectsRoot(rootDirectory?: string): string {
  if (rootDirectory) {
    return resolve(rootDirectory);
  }

  if (process.env.NOVEL_PROJECTS_ROOT) {
    return resolve(process.env.NOVEL_PROJECTS_ROOT);
  }

  return resolve(/* turbopackIgnore: true */ process.cwd(), "projects");
}

function normalizeFormats(formats?: QuickBookFormat[]): QuickBookFormat[] {
  const values = formats?.length ? formats : ["epub"];
  return Array.from(new Set(values)) as QuickBookFormat[];
}

function deriveOutputPath(
  requestedPath: string | undefined,
  format: QuickBookFormat,
  topic: string,
  totalFormats: number,
): string | null {
  if (!requestedPath) {
    return null;
  }

  const resolvedPath = resolve(requestedPath);
  const extension = extname(resolvedPath).toLowerCase();
  const desiredExtension = `.${format}`;

  if (totalFormats === 1 && extension === desiredExtension) {
    return resolvedPath;
  }

  if (extension.length === 0) {
    return join(resolvedPath, `${sanitizeFilename(topic)}.${format}`);
  }

  const parsed = parse(resolvedPath);
  const suffix = totalFormats === 1 ? "" : `-${format}`;

  return join(parsed.dir, `${parsed.name}${suffix}${desiredExtension}`);
}

async function copyExportToRequestedPath(
  sourcePath: string,
  targetPath: string | null,
): Promise<string> {
  if (!targetPath) {
    return sourcePath;
  }

  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);

  return targetPath;
}

async function writePlotFile(projectDirectory: string, plot: unknown): Promise<void> {
  const plotPath = join(projectDirectory, "plot.json");
  await writeFile(plotPath, `${JSON.stringify(plot, null, 2)}\n`, "utf8");
}

async function injectReferencesToMemory(
  databasePath: string,
  summary: string,
  chunks: string[],
  embeddings: number[][],
): Promise<void> {
  const db = createNovelMemoryDatabase(databasePath);

  try {
    db.prepare(
      `
      INSERT INTO world_states (chapter_number, key, value)
      VALUES (?, ?, ?)
      `,
    ).run(0, "reference_summary", summary);

    const statement = db.prepare(
      `
      INSERT INTO memory_embeddings (chapter_number, content_type, content, embedding)
      VALUES (?, ?, ?, ?)
      `,
    );

    for (let index = 0; index < chunks.length; index += 1) {
      statement.run(
        0,
        "reference",
        chunks[index],
        Buffer.from(JSON.stringify(embeddings[index] ?? []), "utf8"),
      );
    }
  } finally {
    db.close();
  }
}

function countForeshadowRows(databasePath: string, status: string): number {
  const db = createNovelMemoryDatabase(databasePath);

  try {
    const row = db
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM foreshadowing
        WHERE status = ?
        `,
      )
      .get(status) as { count: number };

    return row?.count ?? 0;
  } finally {
    db.close();
  }
}

export async function runQuickBook(
  request: QuickBookRequest,
  onProgress: (progress: QuickBookProgress) => void = () => undefined,
  options: QuickBookRunOptions = {},
): Promise<QuickBookResult> {
  const now = options.now ?? Date.now;
  const startTime = now();
  const router = options.router ?? createRuntimeModelRouter({ fetchImpl: options.fetchImpl });
  const rootDirectory = resolveProjectsRoot(options.rootDirectory);
  const chapters = Math.max(1, request.chapters ?? 100);
  const language = request.language ?? "ko";
  const style = request.style ?? "웹소설체";
  const formats = normalizeFormats(request.format);
  const chapterWordCount = Math.max(600, request.advanced?.chapterWordCount ?? 3000);
  const retryAttempts = Math.max(1, options.retryAttempts ?? 2);
  const estimate = estimateQuickBookCost({
    chapters,
    references: request.references,
    advanced: {
      chapterWordCount,
    },
  });
  const usageTracker = createUsageTracker(estimate);

  onProgress(
    createStageProgress(
      "reference",
      5,
      request.references?.length
        ? "레퍼런스 자료를 분석하고 있습니다..."
        : "레퍼런스 없이 바로 집필 준비를 시작합니다...",
    ),
  );

  const processedRefs =
    request.references?.length
      ? await processReferences(request.references, router, options.fetchImpl)
      : null;

  if (processedRefs) {
    usageTracker.record(processedRefs.rawTexts.join("\n"), processedRefs.summary);
  }

  onProgress(
    createStageProgress("dna", 15, "세계관과 캐릭터를 설계하고 있습니다..."),
  );

  const genre = request.genre ?? (await inferGenre(request.topic, router));
  const dnaResult = await generateAuthorDNA({
    topic: request.topic,
    processedRefs,
    genre,
    style,
    chapters,
    language,
    chapterWordCount,
    router,
  });
  usageTracker.record(dnaResult.prompt, dnaResult.responseText);

  onProgress(
    createStageProgress("plot", 25, "플롯 아크와 감정 곡선을 설계하고 있습니다..."),
  );

  const project = await createNovelProject({
    rootDirectory,
    projectName: sanitizeFilename(request.topic),
    authorDNA: dnaResult.authorDNA,
  });
  const preparedPlot = prepareQuickBookPlot({
    authorDNA: dnaResult.authorDNA,
    emotionCurveTemplate: request.advanced?.emotionCurveTemplate,
  });
  await writePlotFile(project.projectDirectory, preparedPlot.plot);

  if (processedRefs) {
    await injectReferencesToMemory(
      project.databasePath,
      processedRefs.summary,
      processedRefs.chunks,
      processedRefs.embeddings,
    );
  }

  const generation = await runBatchGeneration({
    projectDirectory: project.projectDirectory,
    databasePath: project.databasePath,
    authorDNA: dnaResult.authorDNA,
    preparedPlot,
    processedRefs,
    router,
    retryAttempts,
    startTime,
    now,
    getCostSoFar: usageTracker.getCostSoFar,
    recordUsage: usageTracker.record,
    onProgress,
  });

  onProgress(
    createStageProgress("export", 95, "전자책 파일을 빌드하고 있습니다..."),
  );

  const outputFiles: QuickBookResult["outputFiles"] = [];

  for (const format of formats) {
    const exported = await exportProject({
      projectDirectory: project.projectDirectory,
      from: 1,
      to: chapters,
      title: request.topic,
      format,
    });
    const finalPath = await copyExportToRequestedPath(
      exported.outputPath,
      deriveOutputPath(request.outputPath, format, request.topic, formats.length),
    );
    const fileStats = await stat(finalPath);

    outputFiles.push({
      format,
      path: finalPath,
      sizeBytes: fileStats.size,
    });
  }

  onProgress(createStageProgress("export", 100, "전자책 생성이 완료되었습니다!"));

  return {
    success: true,
    outputFiles,
    stats: {
      totalChapters: chapters,
      totalWords: generation.totalWords,
      totalTokensUsed: usageTracker.getTotalTokensUsed(),
      totalCost: estimate.totalEstimatedCost,
      totalTime: Math.round((now() - startTime) / 1000),
      charactersCreated: dnaResult.authorDNA.characters.length,
      foreshadowsPlanted: countForeshadowRows(project.databasePath, "seeded"),
      foreshadowsResolved: countForeshadowRows(project.databasePath, "resolved"),
    },
    projectPath: project.projectDirectory,
  };
}
