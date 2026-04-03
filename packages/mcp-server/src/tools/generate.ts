import { z } from "zod";

import { createRuntimeModelRouter, generateChapterRange } from "@22b/engine";

import type { NovelToolDefinition } from "../server.js";

const generateInputSchema = z.object({
  projectDirectory: z.string().min(1),
  from: z.number().int().positive(),
  to: z.number().int().positive(),
});

export function createGenerateTool(): NovelToolDefinition {
  return {
    name: "novel.generate",
    description: "Generate a batch of chapters into an initialized project.",
    inputSchema: generateInputSchema,
    async execute(args) {
      const input = generateInputSchema.parse(args);
      const result = await generateChapterRange({
        projectDirectory: input.projectDirectory,
        from: input.from,
        to: input.to,
        router: createRuntimeModelRouter(),
      });

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
