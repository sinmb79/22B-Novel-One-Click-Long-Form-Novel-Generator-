import type { ChapterGeneratorRouter } from "@22b/engine";
import type { ProcessedReference } from "../types.js";

function fallbackSummary(texts: string[]): string {
  return texts
    .join(" ")
    .split(/(?<=[.!?。])\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ")
    .trim()
    .slice(0, 800);
}

export async function summarizeReferenceTexts(
  texts: string[],
  router: Pick<ChapterGeneratorRouter, "generate">,
): Promise<Pick<ProcessedReference, "summary">> {
  if (texts.length === 0) {
    return { summary: "" };
  }

  const prompt = [
    "Extract useful fiction-writing reference notes from the material below.",
    "Focus on setting, social hierarchy, conflict sources, daily detail, emotional texture, and concrete nouns.",
    "Respond in concise Korean bullet-style prose without markdown bullets.",
    "",
    texts.join("\n\n---\n\n"),
  ].join("\n");

  try {
    const result = await router.generate({
      task: "qa",
      prompt,
    });

    return {
      summary: result.text.trim() || fallbackSummary(texts),
    };
  } catch {
    return {
      summary: fallbackSummary(texts),
    };
  }
}
