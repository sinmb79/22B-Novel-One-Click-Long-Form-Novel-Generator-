import { describe, expect, it, vi } from "vitest";

import { createAnthropicProvider } from "./anthropic.js";

describe("createAnthropicProvider", () => {
  it("calls the Anthropic messages api and joins text blocks", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          content: [
            {
              type: "text",
              text: "First block.",
            },
            {
              type: "text",
              text: "Second block.",
            },
          ],
          usage: {
            input_tokens: 123,
            output_tokens: 456,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    });

    const provider = createAnthropicProvider({
      apiKey: "anthropic-test",
      fetchImpl,
      baseUrl: "https://api.anthropic.com/v1",
    });

    const result = await provider({
      task: "plot",
      prompt: "Design the chapter arc",
      model: "claude-opus-4-6",
    });

    const [url, requestInit] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(requestInit.headers as HeadersInit);
    const body = JSON.parse(String(requestInit.body)) as Record<string, unknown>;

    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(headers.get("x-api-key")).toBe("anthropic-test");
    expect(headers.get("anthropic-version")).toBe("2023-06-01");
    expect(body).toMatchObject({
      model: "claude-opus-4-6",
    });
    expect(result).toEqual({
      text: "First block.\n\nSecond block.",
      tokensUsed: 579,
    });
  });
});
