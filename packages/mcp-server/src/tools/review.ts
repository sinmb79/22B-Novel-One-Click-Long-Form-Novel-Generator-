import { z } from "zod";

import { reviewGeneratedChapters } from "@22b/engine";

import type { NovelToolDefinition } from "../server.js";

const reviewInputSchema = z.object({
  projectDirectory: z.string().min(1),
  chapters: z.array(z.number().int().positive()).min(1),
});

export function createReviewTool(): NovelToolDefinition {
  return {
    name: "novel.review",
    description: "Run rule-based review checks on generated chapter files.",
    inputSchema: reviewInputSchema,
    async execute(args) {
      const input = reviewInputSchema.parse(args);
      const result = await reviewGeneratedChapters(input);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  };
}
