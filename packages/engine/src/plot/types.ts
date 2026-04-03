import type { AuthorDNA, SceneType } from "../author-dna/types.js";

export interface PlotArc {
  name: string;
  startChapter: number;
  endChapter: number;
  climaxChapter: number;
  description: string;
}

export interface ChapterPlan {
  chapterNumber: number;
  arcName: string;
  sceneType: SceneType;
  description: string;
  characters: string[];
  targetTension: number;
  notes: string[];
}

export interface ChapterBeat {
  index: number;
  label: "opener" | "complication" | "turn" | "hook";
  summary: string;
  focusCharacterId: string;
  targetTension: number;
}

export interface PlotArchitecture {
  authorDNA: AuthorDNA;
  arcs: PlotArc[];
  chapters: ChapterPlan[];
  emotionCurve: number[];
}

export interface BuildPlotOptions {
  arcNames?: string[];
  emotionCurve?: number[];
}

export interface DecomposeChapterInput {
  authorDNA: AuthorDNA;
  chapterPlan: ChapterPlan;
}
