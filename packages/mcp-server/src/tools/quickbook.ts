import { z } from "zod";

import { runQuickBook } from "@22b/quickbook";

import type { NovelToolDefinition } from "../server.js";

const quickbookInputSchema = z.object({
  topic: z.string().min(1),
  references: z
    .array(
      z.object({
        type: z.enum(["file", "url", "text"]),
        value: z.string().min(1),
        label: z.string().optional(),
      }),
    )
    .optional(),
  genre: z.string().optional(),
  chapters: z.number().int().positive().optional(),
  style: z.string().optional(),
  language: z.enum(["ko", "en"]).optional(),
  format: z.array(z.enum(["epub", "pdf"])).optional(),
  outputPath: z.string().optional(),
});

export function createQuickBookTool(): NovelToolDefinition {
  return {
    name: "novel.quickbook",
    description:
      "Generate a long-form ebook from a topic and optional references using the QuickBook pipeline.",
    inputSchema: quickbookInputSchema,
    async execute(args) {
      const input = quickbookInputSchema.parse(args);
      const result = await runQuickBook(input);

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
