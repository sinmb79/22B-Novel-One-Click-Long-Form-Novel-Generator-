import type { QuickBookProgress, QuickBookStage } from "../types.js";

const STAGE_LABELS: Record<QuickBookStage, string> = {
  reference: "레퍼런스 분석",
  dna: "세계관 · 캐릭터 설계",
  plot: "플롯 설계",
  generation: "본문 생성",
  export: "전자책 빌드",
};

export function createStageProgress(
  stage: QuickBookStage,
  percent: number,
  message: string,
): QuickBookProgress {
  return {
    stage,
    stageLabel: STAGE_LABELS[stage],
    percent,
    message,
  };
}

export function createGenerationProgress(input: {
  currentChapter: number;
  totalChapters: number;
  estimatedTimeLeft: number;
  costSoFar: number;
}): QuickBookProgress {
  const percent = 25 + Math.floor((input.currentChapter / input.totalChapters) * 65);

  return {
    stage: "generation",
    stageLabel: STAGE_LABELS.generation,
    percent,
    currentChapter: input.currentChapter,
    totalChapters: input.totalChapters,
    estimatedTimeLeft: input.estimatedTimeLeft,
    costSoFar: input.costSoFar,
    message: `${input.currentChapter}/${input.totalChapters}화 생성 중...`,
  };
}
