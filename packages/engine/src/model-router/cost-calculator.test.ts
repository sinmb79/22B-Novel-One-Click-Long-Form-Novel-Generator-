import { describe, expect, it } from "vitest";

import { estimateGenerationCost } from "./cost-calculator.js";

describe("estimateGenerationCost", () => {
  it("produces a cost breakdown by task", () => {
    const estimate = estimateGenerationCost({
      chapters: 10,
      chapterWordCount: 3000,
      models: {
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
      },
    });

    expect(estimate.breakdown.prose).toBeGreaterThan(estimate.breakdown.qa);
    expect(estimate.totalEstimatedCost).toBeGreaterThan(0);
    expect(estimate.estimatedTokens.prose.output).toBeGreaterThan(estimate.estimatedTokens.qa.output);
  });
});
