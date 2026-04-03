import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ZodTypeAny } from "zod";

import { createInitTool } from "./tools/init.js";
import { createPlotTool } from "./tools/plot.js";
import { createGenerateTool } from "./tools/generate.js";
import { createMemoryTool } from "./tools/memory.js";
import { createReviewTool } from "./tools/review.js";
import { createExportTool } from "./tools/export.js";
import { createCostTool } from "./tools/cost.js";
import { createStatusTool } from "./tools/status.js";

export interface NovelToolDefinition {
  name: string;
  description: string;
  inputSchema?: ZodTypeAny;
  execute: (args: unknown) => Promise<CallToolResult> | CallToolResult;
}

export function getNovelToolDefinitions(): NovelToolDefinition[] {
  return [
    createInitTool(),
    createPlotTool(),
    createGenerateTool(),
    createMemoryTool(),
    createReviewTool(),
    createExportTool(),
    createCostTool(),
    createStatusTool(),
  ];
}

export function createNovelMcpServer(): McpServer {
  const server = new McpServer({
    name: "22b-novel",
    version: "0.1.0",
  });

  for (const tool of getNovelToolDefinitions()) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args) => tool.execute(args),
    );
  }

  return server;
}
