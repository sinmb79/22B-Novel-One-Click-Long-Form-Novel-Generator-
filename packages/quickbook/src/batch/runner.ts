import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  autoCommitChapter,
  createNovelMemoryDatabase,
  generateChapter,
  reviewChapter,
} from "@22b/engine";

import { runWithRetry } from "./error-handler.js";
import { createGenerationProgress } from "./progress.js";

import type { PreparedPlot, ProcessedReference, QuickBookProgress } from "../types.js";
import type { AuthorDNA, ChapterGeneratorRouter } from "@22b/engine";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function summarizeText(text: string): string {
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0]?.trim();
  return (firstSentence || text.trim()).slice(0, 180);
}

function selectRelevantMemories(
  processedRefs: ProcessedReference | null,
  chapterNumber: number,
): string[] {
  if (!processedRefs || processedRefs.chunks.length === 0) {
    return [];
  }

  const start = (chapterNumber - 1) % processedRefs.chunks.length;
  return Array.from({ length: Math.min(3, processedRefs.chunks.length) }, (_, index) => {
    return processedRefs.chunks[(start + index) % processedRefs.chunks.length]!;
  });
}

export async function runBatchGeneration(input: {
  projectDirectory: string;
  databasePath: string;
  authorDNA: AuthorDNA;
  preparedPlot: PreparedPlot;
  processedRefs: ProcessedReference | null;
  router: Pick<ChapterGeneratorRouter, "generate">;
  retryAttempts: number;
  startTime: number;
  now: () => number;
  getCostSoFar: (completedChapters: number, totalChapters: number) => number;
  recordUsage: (prompt: string, responseText: string) => void;
  onProgress?: (progress: QuickBookProgress) => void;
}) {
  const db = createNovelMemoryDatabase(input.databasePath);
  const totalChapters = input.authorDNA.meta.targetLength;
  const chaptersDirectory = join(input.projectDirectory, "output", "chapters");
  const recentSummaries: string[] = [];
  let totalWords = 0;

  try {
    for (let chapterNumber = 1; chapterNumber <= totalChapters; chapterNumber += 1) {
      const completedBefore = chapterNumber - 1;
      const elapsed = Math.max(1, input.now() - input.startTime);
      const estimatedTimeLeft =
        completedBefore === 0
          ? Math.round((totalChapters - 1) * 70)
          : Math.round((elapsed / completedBefore / 1000) * (totalChapters - completedBefore));

      input.onProgress?.(
        createGenerationProgress({
          currentChapter: chapterNumber,
          totalChapters,
          estimatedTimeLeft,
          costSoFar: input.getCostSoFar(completedBefore, totalChapters),
        }),
      );

      const draft = await runWithRetry(
        () =>
          generateChapter({
            authorDNA: input.authorDNA,
            plot: input.preparedPlot.plot,
            chapterNumber,
            router: input.router,
            characterStates: [],
            foreshadowing: {
              toSeed: [],
              toHint: [],
              toPayoff: [],
            },
            recentSummaries,
            relevantMemories: selectRelevantMemories(input.processedRefs, chapterNumber),
          }),
        input.retryAttempts,
      );

      const markdown = `# Chapter ${chapterNumber}\n\n${draft.text.trim()}\n`;
      const outputPath = join(chaptersDirectory, `${String(chapterNumber).padStart(3, "0")}.md`);

      await writeFile(outputPath, markdown, "utf8");

      const summary = summarizeText(draft.text);
      recentSummaries.push(summary);
      if (recentSummaries.length > 6) {
        recentSummaries.shift();
      }

      autoCommitChapter(db, {
        chapterNumber,
        text: draft.text,
        chapterSummary: summary,
        keyEvents: draft.beats.map((beat) => beat.summary),
        charactersPresent: draft.context.chapterPlan.characters,
        characterStateChanges: [],
        worldStateChanges: [],
        foreshadowUpdates: [],
      });

      reviewChapter({
        chapterNumber,
        text: draft.text,
        authorDNA: input.authorDNA,
        chapterWordCountTarget: input.authorDNA.meta.chapterWordCount,
        db,
      });

      input.recordUsage(draft.prompt, draft.text);
      totalWords += countWords(draft.text);
    }
  } finally {
    db.close();
  }

  return {
    totalWords,
  };
}
