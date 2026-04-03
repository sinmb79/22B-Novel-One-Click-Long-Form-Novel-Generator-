import { describe, expect, it, vi } from "vitest";

import { createRuntimeModelRouter } from "./runtime.js";

describe("createRuntimeModelRouter", () => {
  it("prefers task-specific env overrides over shared defaults", async () => {
    const anthropic = vi.fn(async () => ({ text: "anthropic", tokensUsed: 120 }));
    const openai = vi.fn(async () => ({ text: "openai", tokensUsed: 80 }));
    const stub = vi.fn(async () => ({ text: "stub", tokensUsed: 10 }));

    const router = createRuntimeModelRouter({
      env: {
        NOVEL_PROVIDER: "anthropic",
        NOVEL_MODEL: "claude-sonnet-4-6",
        NOVEL_PROVIDER_QA: "openai",
        NOVEL_MODEL_QA: "gpt-5-mini",
      },
      providers: {
        anthropic,
        openai,
        stub,
      },
    });

    await router.generate({
      task: "prose",
      prompt: "Expand the harbor scene",
    });
    await router.generate({
      task: "qa",
      prompt: "Review continuity",
    });

    expect(anthropic).toHaveBeenCalledWith({
      task: "prose",
      prompt: "Expand the harbor scene",
      model: "claude-sonnet-4-6",
    });
    expect(openai).toHaveBeenCalledWith({
      task: "qa",
      prompt: "Review continuity",
      model: "gpt-5-mini",
    });
    expect(stub).not.toHaveBeenCalled();
  });

  it("throws a helpful error when a configured provider has no credentials", () => {
    expect(() =>
      createRuntimeModelRouter({
        env: {
          NOVEL_PROVIDER: "openai",
          NOVEL_MODEL: "gpt-5",
        },
      }),
    ).toThrow(/OPENAI_API_KEY/);
  });
});
