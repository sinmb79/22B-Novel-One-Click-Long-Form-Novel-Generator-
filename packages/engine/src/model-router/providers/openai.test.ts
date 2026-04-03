import { describe, expect, it, vi } from "vitest";

import { createOpenAIProvider } from "./openai.js";

describe("createOpenAIProvider", () => {
  it("calls the OpenAI responses api and returns output_text", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          output_text: "Expanded chapter prose",
          usage: {
            total_tokens: 321,
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

    const provider = createOpenAIProvider({
      apiKey: "sk-test",
      fetchImpl,
      baseUrl: "https://api.openai.com/v1",
    });

    const result = await provider({
      task: "prose",
      prompt: "Expand chapter 1",
      model: "gpt-5",
    });

    const [url, requestInit] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(requestInit.headers as HeadersInit);
    const body = JSON.parse(String(requestInit.body)) as Record<string, unknown>;

    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(headers.get("authorization")).toBe("Bearer sk-test");
    expect(body).toMatchObject({
      model: "gpt-5",
      input: "Expand chapter 1",
    });
    expect(result).toEqual({
      text: "Expanded chapter prose",
      tokensUsed: 321,
    });
  });

  it("falls back to nested response output items when output_text is absent", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          output: [
            {
              content: [
                {
                  type: "output_text",
                  text: "Nested output text",
                },
              ],
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    });

    const provider = createOpenAIProvider({
      apiKey: "sk-test",
      fetchImpl,
    });

    const result = await provider({
      task: "qa",
      prompt: "Review chapter 2",
      model: "gpt-5-mini",
    });

    expect(result.text).toBe("Nested output text");
    expect(result.tokensUsed).toBeGreaterThan(0);
  });
});
