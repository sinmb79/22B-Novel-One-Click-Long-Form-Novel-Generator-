import type { AssembledChapterContext } from "../context-assembler.js";
import type { ChapterBeat } from "../../plot/types.js";

export function buildChapterPrompt(
  context: AssembledChapterContext,
  beats: ChapterBeat[],
): string {
  const beatLines = beats
    .map((beat) => `${beat.index}. [${beat.label}] ${beat.summary}`)
    .join("\n");

  return [
    `Core message: ${context.philosophy.coreMessage}`,
    `Reader feeling: ${context.philosophy.readerFeeling}`,
    `Chapter: ${context.chapterPlan.chapterNumber}`,
    `Arc: ${context.chapterPlan.arcName}`,
    `Scene type: ${context.chapterPlan.sceneType}`,
    `Target tension: ${context.chapterPlan.targetTension}`,
    `Foreshadow hint count: ${context.foreshadowing.toHint.length}`,
    `Recent summaries: ${context.recentSummaries.join(" | ") || "none"}`,
    `Relevant memories: ${context.relevantMemories.join(" | ") || "none"}`,
    "Beats:",
    beatLines,
  ].join("\n");
}
