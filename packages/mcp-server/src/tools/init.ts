import { z } from "zod";

import { createNovelProject, parseAuthorDNA } from "@22b/engine";

import type { NovelToolDefinition } from "../server.js";

const initInputSchema = z.object({
  rootDirectory: z.string().min(1),
  projectName: z.string().min(1),
  authorDNA: z.unknown(),
});

export function createInitTool(): NovelToolDefinition {
  return {
    name: "novel.init",
    description: "Create a new local novel project from Author DNA.",
    inputSchema: initInputSchema,
    async execute(args) {
      const input = initInputSchema.parse(args);
      const authorDNA = parseAuthorDNA(input.authorDNA);
      const project = await createNovelProject({
        rootDirectory: input.rootDirectory,
        projectName: input.projectName,
        authorDNA,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(project, null, 2),
          },
        ],
      };
    },
  };
}
