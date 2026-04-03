import { describe, expect, it } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { createNovelMcpServer, getNovelToolDefinitions } from "./server.js";

describe("createNovelMcpServer", () => {
  it("exposes the phase 0 tool definitions", () => {
    const toolNames = getNovelToolDefinitions().map((tool) => tool.name);

    expect(toolNames).toEqual(
      expect.arrayContaining([
        "novel.init",
        "novel.plot",
        "novel.generate",
        "novel.memory",
        "novel.review",
        "novel.export",
        "novel.cost",
        "novel.status",
      ]),
    );
  });

  it("creates an MCP server instance", () => {
    const server = createNovelMcpServer();

    expect(server).toBeInstanceOf(McpServer);
  });
});
