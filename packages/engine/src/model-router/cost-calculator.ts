export interface TaskCostRate {
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
}

export interface CostCalculatorInput {
  chapters: number;
  chapterWordCount: number;
  models: {
    plot: TaskCostRate;
    prose: TaskCostRate;
    qa: TaskCostRate;
  };
}

export interface CostEstimate {
  totalEstimatedCost: number;
  breakdown: Record<"plot" | "prose" | "qa", number>;
  estimatedTokens: Record<"plot" | "prose" | "qa", { input: number; output: number }>;
}

function roundCurrency(value: number): number {
  return Number(value.toFixed(4));
}

export function estimateGenerationCost(input: CostCalculatorInput): CostEstimate {
  const estimatedTokens = {
    plot: {
      input: Math.max(2000, input.chapters * 150),
      output: Math.max(1000, input.chapters * 120),
    },
    prose: {
      input: input.chapters * Math.round(input.chapterWordCount * 0.9),
      output: input.chapters * Math.round(input.chapterWordCount * 1.3),
    },
    qa: {
      input: input.chapters * Math.round(input.chapterWordCount * 1.1),
      output: input.chapters * Math.round(input.chapterWordCount * 0.2),
    },
  };

  const breakdown = {
    plot: roundCurrency(
      (estimatedTokens.plot.input / 1000) * input.models.plot.inputCostPer1kTokens +
        (estimatedTokens.plot.output / 1000) * input.models.plot.outputCostPer1kTokens,
    ),
    prose: roundCurrency(
      (estimatedTokens.prose.input / 1000) * input.models.prose.inputCostPer1kTokens +
        (estimatedTokens.prose.output / 1000) * input.models.prose.outputCostPer1kTokens,
    ),
    qa: roundCurrency(
      (estimatedTokens.qa.input / 1000) * input.models.qa.inputCostPer1kTokens +
        (estimatedTokens.qa.output / 1000) * input.models.qa.outputCostPer1kTokens,
    ),
  };

  return {
    totalEstimatedCost: roundCurrency(breakdown.plot + breakdown.prose + breakdown.qa),
    breakdown,
    estimatedTokens,
  };
}
