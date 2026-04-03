import { z } from "zod";

import { exportProject } from "@22b/engine";

import type { NovelToolDefinition } from "../server.js";

const exportInputSchema = z.object({
  projectDirectory: z.string().min(1),
  from: z.number().int().positive(),
  to: z.number().int().positive(),
  title: z.string().min(1),
  format: z.enum(["markdown", "txt", "json", "epub", "pdf"]).default("markdown"),
});

export function createExportTool(): NovelToolDefinition {
  return {
    name: "novel.export",
    description: "Export a chapter range into a combined markdown manuscript.",
    inputSchema: exportInputSchema,
    async execute(args) {
      const input = exportInputSchema.parse(args);
      const result = await exportProject(input);

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
