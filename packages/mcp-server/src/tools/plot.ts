import { z } from "zod";

import { buildPlotArchitecture, parseAuthorDNA } from "@22b/engine";

import type { NovelToolDefinition } from "../server.js";

const plotInputSchema = z.object({
  authorDNA: z.unknown(),
  arcNames: z.array(z.string().min(1)).optional(),
  emotionCurve: z.array(z.number().min(0).max(1)).optional(),
});

export function createPlotTool(): NovelToolDefinition {
  return {
    name: "novel.plot",
    description: "Generate a deterministic plot architecture from Author DNA.",
    inputSchema: plotInputSchema,
    async execute(args) {
      const input = plotInputSchema.parse(args);
      const authorDNA = parseAuthorDNA(input.authorDNA);
      const plot = buildPlotArchitecture(authorDNA, {
        arcNames: input.arcNames,
        emotionCurve: input.emotionCurve,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                arcs: plot.arcs,
                chapters: plot.chapters,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  };
}
