import type { AuthorDNA, SceneType } from "../author-dna/types.js";

import type { BuildPlotOptions, ChapterPlan, PlotArc, PlotArchitecture } from "./types.js";

const defaultArcNames = ["Setup", "Pressure", "Break", "Aftermath"];

function buildEmotionCurve(totalChapters: number, customCurve?: number[]): number[] {
  if (customCurve) {
    if (customCurve.length !== totalChapters) {
      throw new Error(`emotionCurve must contain ${totalChapters} entries`);
    }

    return customCurve;
  }

  return Array.from({ length: totalChapters }, (_, index) =>
    Number(((index + 1) / totalChapters).toFixed(2)),
  );
}

function buildArcs(totalChapters: number, arcNames: string[]): PlotArc[] {
  return arcNames.map((name, index) => {
    const startChapter = Math.floor((index * totalChapters) / arcNames.length) + 1;
    const endChapter = Math.floor(((index + 1) * totalChapters) / arcNames.length);
    const climaxChapter = Math.max(startChapter, Math.floor((startChapter + endChapter) / 2));

    return {
      name,
      startChapter,
      endChapter,
      climaxChapter,
      description: `${name} arc spanning chapters ${startChapter}-${endChapter}`,
    };
  });
}

function pickSceneType(authorDNA: AuthorDNA, chapterNumber: number, targetTension: number): SceneType {
  const available = new Set(authorDNA.styleProfiles.map((profile) => profile.sceneType));

  if (chapterNumber === 1 && available.has("mystery")) {
    return "mystery";
  }

  if (targetTension >= 0.8 && available.has("climax")) {
    return "climax";
  }

  if (available.has("introspection")) {
    return "introspection";
  }

  return authorDNA.styleProfiles[0]?.sceneType ?? "dialogue";
}

function buildNotes(authorDNA: AuthorDNA, chapterNumber: number): string[] {
  const notes = authorDNA.world.timeline
    .filter((entry) => entry.chapter === chapterNumber)
    .map((entry) => entry.event);

  for (const character of authorDNA.characters) {
    for (const turningPoint of character.growthArc.turningPoints) {
      if (turningPoint.chapter === chapterNumber) {
        notes.push(turningPoint.event);
      }
    }
  }

  return notes;
}

function buildChapterPlans(
  authorDNA: AuthorDNA,
  arcs: PlotArc[],
  emotionCurve: number[],
): ChapterPlan[] {
  const majorCharacters = authorDNA.characters
    .filter((character) => character.role !== "minor")
    .map((character) => character.id);

  return emotionCurve.map((targetTension, index) => {
    const chapterNumber = index + 1;
    const arc = arcs.find(
      (candidate) =>
        chapterNumber >= candidate.startChapter && chapterNumber <= candidate.endChapter,
    );

    const sceneType = pickSceneType(authorDNA, chapterNumber, targetTension);
    const notes = buildNotes(authorDNA, chapterNumber);

    return {
      chapterNumber,
      arcName: arc?.name ?? arcs[arcs.length - 1]?.name ?? "Main",
      sceneType,
      description: `${sceneType} chapter advancing the ${arc?.name ?? "main"} arc.`,
      characters: majorCharacters,
      targetTension,
      notes,
    };
  });
}

export function buildPlotArchitecture(
  authorDNA: AuthorDNA,
  options: BuildPlotOptions = {},
): PlotArchitecture {
  const totalChapters = authorDNA.meta.targetLength;
  const arcNames = options.arcNames?.length
    ? options.arcNames
    : defaultArcNames.slice(0, Math.min(defaultArcNames.length, totalChapters));
  const emotionCurve = buildEmotionCurve(totalChapters, options.emotionCurve);
  const arcs = buildArcs(totalChapters, arcNames);
  const chapters = buildChapterPlans(authorDNA, arcs, emotionCurve);

  return {
    authorDNA,
    arcs,
    chapters,
    emotionCurve,
  };
}
