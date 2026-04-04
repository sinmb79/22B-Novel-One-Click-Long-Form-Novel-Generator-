import { estimateGenerationCost } from "@22b/engine";

import type { QuickBookCostEstimate, QuickBookRequest } from "../types.js";

const DEFAULT_MODEL_COSTS = {
  plot: {
    inputCostPer1kTokens: 0.015,
    outputCostPer1kTokens: 0.075,
  },
  prose: {
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
  },
  qa: {
    inputCostPer1kTokens: 0.0008,
    outputCostPer1kTokens: 0.004,
  },
} as const;

function roundCurrency(value: number): number {
  return Number(value.toFixed(4));
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.trim().length / 4));
}

export function estimateQuickBookCost(request: Pick<
  QuickBookRequest,
  "chapters" | "references" | "advanced"
>): QuickBookCostEstimate {
  const chapters = Math.max(1, request.chapters ?? 100);
  const chapterWordCount = Math.max(600, request.advanced?.chapterWordCount ?? 3000);
  const base = estimateGenerationCost({
    chapters,
    chapterWordCount,
    models: DEFAULT_MODEL_COSTS,
  });
  const reference = request.references?.length
    ? roundCurrency(0.008 + request.references.length * 0.003)
    : 0;
  const dna = roundCurrency(Math.max(0.12, chapters * 0.0015));
  const plot = roundCurrency(base.breakdown.plot + Math.max(0.05, chapters * 0.0008));
  const prose = roundCurrency(base.breakdown.prose);
  const qa = roundCurrency(base.breakdown.qa);

  return {
    totalEstimatedCost: roundCurrency(reference + dna + plot + prose + qa),
    estimatedTimeSeconds: Math.max(180, chapters * 70),
    breakdown: {
      reference,
      dna,
      plot,
      prose,
      qa,
    },
  };
}

export function createUsageTracker(estimate: QuickBookCostEstimate) {
  let totalTokensUsed = 0;

  return {
    record(prompt: string, responseText: string) {
      totalTokensUsed += estimateTokens(prompt) + estimateTokens(responseText);
    },
    getTotalTokensUsed() {
      return totalTokensUsed;
    },
    getCostSoFar(completedChapters: number, totalChapters: number) {
      const chapterRatio =
        totalChapters > 0
          ? Math.min(1, Math.max(0, completedChapters / totalChapters))
          : 0;

      return roundCurrency(
        estimate.breakdown.reference +
          estimate.breakdown.dna +
          estimate.breakdown.plot +
          estimate.breakdown.prose * chapterRatio +
          estimate.breakdown.qa * chapterRatio,
      );
    },
  };
}
