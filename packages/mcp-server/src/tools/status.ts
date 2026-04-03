import { engineVersion } from "@22b/engine";

import type { NovelToolDefinition } from "../server.js";

export function createStatusTool(): NovelToolDefinition {
  return {
    name: "novel.status",
    description: "Report current Phase 0 foundation status.",
    async execute() {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                engineVersion,
                phase: "0-foundation",
                availableTools: [
                  "novel.init",
                  "novel.plot",
                  "novel.generate",
                  "novel.memory",
                  "novel.review",
                  "novel.export",
                  "novel.cost",
                  "novel.status",
                ],
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
