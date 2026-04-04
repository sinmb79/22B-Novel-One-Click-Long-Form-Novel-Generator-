import { buildPlotArchitecture } from "@22b/engine";

import { getGenrePreset } from "../auto-dna/genre-presets.js";

import { buildEmotionCurve, planArcNames } from "./chapter-planner.js";
import { scheduleHooks } from "./hook-scheduler.js";

import type { AuthorDNA } from "@22b/engine";
import type { PreparedPlot } from "../types.js";

export function prepareQuickBookPlot(input: {
  authorDNA: AuthorDNA;
  emotionCurveTemplate?: string;
}): PreparedPlot {
  const preset = getGenrePreset(input.authorDNA.meta.genre);
  const hookChapters = scheduleHooks(
    input.authorDNA.meta.targetLength,
    preset.conventions.hookFrequency,
  );
  const options = {
    arcNames: planArcNames(preset, input.authorDNA.meta.targetLength),
    emotionCurve: buildEmotionCurve(input.authorDNA.meta.targetLength, hookChapters),
  };
  const plot = buildPlotArchitecture(input.authorDNA, options);

  return {
    plot: {
      ...plot,
      chapters: plot.chapters.map((chapter) => ({
        ...chapter,
        notes: hookChapters.includes(chapter.chapterNumber)
          ? [...chapter.notes, "Place a strong end-of-chapter hook."]
          : chapter.notes,
      })),
    },
    hookChapters,
    options,
  };
}
