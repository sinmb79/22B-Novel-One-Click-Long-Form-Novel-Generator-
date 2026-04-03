import { describe, expect, it, vi } from "vitest";

import { createModelRouter } from "./router.js";

describe("createModelRouter", () => {
  it("routes generation requests to the configured provider", async () => {
    const anthropic = vi.fn(async ({ prompt, model }: { prompt: string; model: string }) => ({
      text: `${model}:${prompt}`,
      tokensUsed: 42,
    }));

    const router = createModelRouter(
      {
        plot: { provider: "anthropic", model: "claude-opus-4-1" },
        prose: { provider: "anthropic", model: "claude-sonnet-4-1" },
        qa: { provider: "anthropic", model: "claude-haiku-4-1" },
      },
      {
        anthropic,
      },
    );

    const result = await router.generate({
      task: "prose",
      prompt: "Expand chapter 1",
    });

    expect(anthropic).toHaveBeenCalledWith({
      prompt: "Expand chapter 1",
      model: "claude-sonnet-4-1",
      task: "prose",
    });
    expect(result.text).toContain("claude-sonnet-4-1");
  });

  it("throws when the configured provider is missing", async () => {
    const router = createModelRouter(
      {
        plot: { provider: "anthropic", model: "claude-opus-4-1" },
        prose: { provider: "openai", model: "gpt-4.1" },
        qa: { provider: "anthropic", model: "claude-haiku-4-1" },
      },
      {
        anthropic: async () => ({ text: "unused", tokensUsed: 0 }),
      },
    );

    await expect(
      router.generate({
        task: "prose",
        prompt: "Expand chapter 2",
      }),
    ).rejects.toThrow(/Provider "openai" is not registered/);
  });
});
