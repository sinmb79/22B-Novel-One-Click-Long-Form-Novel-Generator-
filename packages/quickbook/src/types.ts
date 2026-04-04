import type { AuthorDNA, BuildPlotOptions, ChapterGeneratorRouter, PlotArchitecture } from "@22b/engine";

export type QuickBookFormat = "epub" | "pdf";
export type QuickBookStage = "reference" | "dna" | "plot" | "generation" | "export";

export interface ReferenceInput {
  type: "file" | "url" | "text";
  value: string;
  label?: string;
}

export interface QuickBookRequest {
  topic: string;
  references?: ReferenceInput[];
  genre?: string;
  chapters?: number;
  style?: string;
  language?: "ko" | "en";
  format?: QuickBookFormat[];
  outputPath?: string;
  advanced?: {
    chapterWordCount?: number;
    emotionCurveTemplate?: string;
    models?: {
      plot?: string;
      prose?: string;
      qa?: string;
    };
  };
}

export interface QuickBookProgress {
  stage: QuickBookStage;
  stageLabel: string;
  percent: number;
  currentChapter?: number;
  totalChapters?: number;
  estimatedTimeLeft?: number;
  costSoFar?: number;
  message: string;
}

export interface QuickBookResult {
  success: boolean;
  outputFiles: Array<{
    format: QuickBookFormat;
    path: string;
    sizeBytes: number;
  }>;
  stats: {
    totalChapters: number;
    totalWords: number;
    totalTokensUsed: number;
    totalCost: number;
    totalTime: number;
    charactersCreated: number;
    foreshadowsPlanted: number;
    foreshadowsResolved: number;
  };
  projectPath: string;
}

export interface ProcessedReference {
  rawTexts: string[];
  summary: string;
  chunks: string[];
  embeddings: number[][];
  sources: string[];
}

export interface QuickBookCostEstimate {
  totalEstimatedCost: number;
  estimatedTimeSeconds: number;
  breakdown: {
    reference: number;
    dna: number;
    plot: number;
    prose: number;
    qa: number;
  };
}

export interface GenrePreset {
  id: string;
  name: string;
  conventions: {
    pacing: string;
    hookFrequency: number;
    typicalArcs: number;
    readerExpectations: string[];
  };
  styleProfiles: AuthorDNA["styleProfiles"];
  characterArchetypes: string[];
  emotionCurveTemplate: string;
}

export interface PreparedPlot {
  plot: PlotArchitecture;
  hookChapters: number[];
  options: BuildPlotOptions;
}

export interface QuickBookRunOptions {
  rootDirectory?: string;
  router?: Pick<ChapterGeneratorRouter, "generate">;
  fetchImpl?: typeof fetch;
  now?: () => number;
  retryAttempts?: number;
}
