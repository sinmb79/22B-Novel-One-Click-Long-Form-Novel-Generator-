import { z } from "zod";

import { queryProjectMemory } from "@22b/engine";

import type { NovelToolDefinition } from "../server.js";

const memoryInputSchema = z.object({
  projectDirectory: z.string().min(1),
  action: z.enum(["query", "list-characters", "list-foreshadow"]),
  query: z.string().optional(),
});

export function createMemoryTool(): NovelToolDefinition {
  return {
    name: "novel.memory",
    description: "Query persisted project memory from the local novel database.",
    inputSchema: memoryInputSchema,
    async execute(args) {
      const input = memoryInputSchema.parse(args);
      const result = await queryProjectMemory(input);

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
