import type { AuthorDNA, StyleProfile, WorldRule } from "../author-dna/types.js";
import type { ChapterPlan } from "../plot/types.js";

export interface CharacterStateSnapshot {
  characterId: string;
  emotionalState?: string;
  physicalState?: string;
  location?: string;
}

export interface ChapterForeshadowingContext {
  toSeed: string[];
  toHint: string[];
  toPayoff: string[];
}

export interface AssembleChapterContextInput {
  authorDNA: AuthorDNA;
  chapterPlan: ChapterPlan;
  characterStates: CharacterStateSnapshot[];
  foreshadowing: ChapterForeshadowingContext;
  recentSummaries: string[];
  relevantMemories: string[];
}

export interface AssembledChapterContext {
  philosophy: AuthorDNA["philosophy"];
  chapterPlan: ChapterPlan;
  styleProfile: StyleProfile;
  worldRules: WorldRule[];
  characterStates: CharacterStateSnapshot[];
  foreshadowing: ChapterForeshadowingContext;
  recentSummaries: string[];
  relevantMemories: string[];
}

export function assembleChapterContext({
  authorDNA,
  chapterPlan,
  characterStates,
  foreshadowing,
  recentSummaries,
  relevantMemories,
}: AssembleChapterContextInput): AssembledChapterContext {
  const styleProfile =
    authorDNA.styleProfiles.find((profile) => profile.sceneType === chapterPlan.sceneType) ??
    authorDNA.styleProfiles[0];

  if (!styleProfile) {
    throw new Error("Author DNA must include at least one style profile.");
  }

  return {
    philosophy: authorDNA.philosophy,
    chapterPlan,
    styleProfile,
    worldRules: authorDNA.world.rules.filter((rule) =>
      rule.relevantTo.includes(chapterPlan.sceneType),
    ),
    characterStates,
    foreshadowing,
    recentSummaries,
    relevantMemories,
  };
}
