import { assembleChapterContext } from "./context-assembler.js";
import { buildChapterPrompt } from "./prompt-templates/beat-expand.js";
import { decomposeChapterToBeats } from "../plot/beat-decomposer.js";

import type {
  AssembleChapterContextInput,
  AssembledChapterContext,
  ChapterForeshadowingContext,
  CharacterStateSnapshot,
} from "./context-assembler.js";
import type { AuthorDNA } from "../author-dna/types.js";
import type { ModelGenerationResult, ModelTask } from "../model-router/types.js";
import type { ChapterBeat, PlotArchitecture } from "../plot/types.js";

export interface ChapterGeneratorRouter {
  generate(request: { task: ModelTask; prompt: string }): Promise<ModelGenerationResult>;
}

export interface GenerateChapterInput {
  authorDNA: AuthorDNA;
  plot: PlotArchitecture;
  chapterNumber: number;
  router: ChapterGeneratorRouter;
  characterStates: CharacterStateSnapshot[];
  foreshadowing: ChapterForeshadowingContext;
  recentSummaries: string[];
  relevantMemories: string[];
}

export interface GeneratedChapterDraft {
  chapterNumber: number;
  text: string;
  prompt: string;
  context: AssembledChapterContext;
  beats: ChapterBeat[];
  tokensUsed: number;
}

export async function generateChapter({
  authorDNA,
  plot,
  chapterNumber,
  router,
  characterStates,
  foreshadowing,
  recentSummaries,
  relevantMemories,
}: GenerateChapterInput): Promise<GeneratedChapterDraft> {
  const chapterPlan = plot.chapters.find((chapter) => chapter.chapterNumber === chapterNumber);

  if (!chapterPlan) {
    throw new Error(`Plot does not contain chapter ${chapterNumber}`);
  }

  const contextInput: AssembleChapterContextInput = {
    authorDNA,
    chapterPlan,
    characterStates,
    foreshadowing,
    recentSummaries,
    relevantMemories,
  };
  const context = assembleChapterContext(contextInput);
  const beats = decomposeChapterToBeats({
    authorDNA,
    chapterPlan,
  });
  const prompt = buildChapterPrompt(context, beats);
  const result = await router.generate({
    task: "prose",
    prompt,
  });

  return {
    chapterNumber,
    text: result.text,
    prompt,
    context,
    beats,
    tokensUsed: result.tokensUsed,
  };
}
