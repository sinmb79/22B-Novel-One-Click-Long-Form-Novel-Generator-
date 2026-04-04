import type { GenrePreset } from "../types.js";

const ARC_LABELS = [
  "Opening",
  "Pressure",
  "Reversal",
  "Break",
  "Climax",
  "Aftermath",
];

export function planArcNames(preset: GenrePreset, totalChapters: number): string[] {
  const desiredCount = Math.max(3, Math.min(preset.conventions.typicalArcs, totalChapters));
  return ARC_LABELS.slice(0, desiredCount);
}

export function buildEmotionCurve(
  totalChapters: number,
  hookChapters: number[],
): number[] {
  return Array.from({ length: totalChapters }, (_, index) => {
    const chapterNumber = index + 1;
    const base = 0.18 + (chapterNumber / totalChapters) * 0.68;
    const hookBonus = hookChapters.includes(chapterNumber) ? 0.12 : 0;

    return Number(Math.min(0.98, base + hookBonus).toFixed(2));
  });
}
