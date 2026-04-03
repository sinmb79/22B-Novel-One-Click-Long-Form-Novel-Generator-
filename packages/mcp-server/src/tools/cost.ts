import { z } from "zod";

import { estimateGenerationCost } from "@22b/engine";

import type { NovelToolDefinition } from "../server.js";

const costInputSchema = z.object({
  chapters: z.number().int().positive(),
  chapterWordCount: z.number().int().positive().default(3000),
});

export function createCostTool(): NovelToolDefinition {
  return {
    name: "novel.cost",
    description: "Estimate cost for a batch of generated chapters.",
    inputSchema: costInputSchema,
    async execute(args) {
      const input = costInputSchema.parse(args);
      const estimate = estimateGenerationCost({
        chapters: input.chapters,
        chapterWordCount: input.chapterWordCount,
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

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(estimate, null, 2),
          },
        ],
      };
    },
  };
}
