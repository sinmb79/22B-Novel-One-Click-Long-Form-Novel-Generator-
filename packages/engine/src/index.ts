export const engineVersion = "0.1.0";

export { AuthorDNASchema, parseAuthorDNA } from "./author-dna/manager.js";
export type { AuthorDNA, CharacterSoul, StyleProfile } from "./author-dna/types.js";
export {
  createNovelMemoryDatabase,
  listTableNames,
  readProjectMeta,
} from "./memory/db.js";
export type { MemoryBootstrapOptions, NovelMemoryDatabase } from "./memory/db.js";
export { autoCommitChapter } from "./memory/auto-commit.js";
export type {
  AutoCommitChapterInput,
  CharacterStateChange,
  ForeshadowUpdate,
  WorldStateChange,
} from "./memory/auto-commit.js";
export { buildPlotArchitecture } from "./plot/architect.js";
export { decomposeChapterToBeats } from "./plot/beat-decomposer.js";
export { assembleChapterContext } from "./generator/context-assembler.js";
export { generateChapter } from "./generator/chapter-generator.js";
export { createModelRouter } from "./model-router/router.js";
export { createRuntimeModelRouter } from "./model-router/runtime.js";
export { estimateGenerationCost } from "./model-router/cost-calculator.js";
export { reviewChapter } from "./quality/reviewer.js";
export { exportArtifact } from "./export/exporter.js";
export {
  createNovelProject,
  exportProject,
  exportProjectAsMarkdown,
  generateChapterRange,
  queryProjectMemory,
  reviewGeneratedChapters,
} from "./project/project.js";
export type {
  AssembleChapterContextInput,
  AssembledChapterContext,
  ChapterForeshadowingContext,
  CharacterStateSnapshot,
} from "./generator/context-assembler.js";
export type {
  ChapterGeneratorRouter,
  GenerateChapterInput,
  GeneratedChapterDraft,
} from "./generator/chapter-generator.js";
export type {
  CreateNovelProjectInput,
  ExportProjectInput,
  ExportProjectResult,
  ExportProjectAsMarkdownInput,
  ExportProjectAsMarkdownResult,
  GenerateChapterRangeInput,
  GenerateChapterRangeResult,
  NovelProjectInfo,
  QueryProjectMemoryInput,
  QueryProjectMemoryResult,
  ReviewGeneratedChaptersInput,
  ReviewGeneratedChaptersResult,
} from "./project/project.js";
export type { ExportChapter, ExportFormat } from "./export/types.js";
export type {
  BuildPlotOptions,
  ChapterBeat,
  ChapterPlan,
  DecomposeChapterInput,
  PlotArc,
  PlotArchitecture,
} from "./plot/types.js";
export type {
  ModelGenerationRequest,
  ModelGenerationResult,
  ModelProvider,
  ModelRoute,
  ModelRouterConfig,
  ModelTask,
} from "./model-router/types.js";
export type { RuntimeModelRouterOptions } from "./model-router/runtime.js";
export type {
  CostCalculatorInput,
  CostEstimate,
  TaskCostRate,
} from "./model-router/cost-calculator.js";
export type { ReviewChapterInput, ReviewChapterResult, ReviewIssue } from "./quality/types.js";
