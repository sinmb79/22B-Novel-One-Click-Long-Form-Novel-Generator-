import { describe, expect, it, vi } from "vitest";

import { buildPlotArchitecture } from "../plot/architect.js";
import { createSampleAuthorDNA } from "../test/fixtures.js";
import { generateChapter } from "./chapter-generator.js";

describe("generateChapter", () => {
  it("assembles prompt context and routes prose generation", async () => {
    const authorDNA = createSampleAuthorDNA();
    const plot = buildPlotArchitecture(authorDNA);
    const router = {
      generate: vi.fn(async ({ task, prompt }: { task: string; prompt: string }) => ({
        text: `${task}:${prompt.slice(0, 40)}`,
        tokensUsed: 128,
      })),
    };

    const chapter = await generateChapter({
      authorDNA,
      plot,
      chapterNumber: 3,
      router,
      characterStates: [
        {
          characterId: "protagonist",
          emotionalState: "conflicted",
          location: "lower-harbor",
        },
      ],
      foreshadowing: {
        toSeed: [],
        toHint: ["The tidewall hum changes"],
        toPayoff: [],
      },
      recentSummaries: ["Seo Yoon discovers a sealed vault beneath the market."],
      relevantMemories: ["Han Mir once covered up an extraction accident."],
    });

    expect(router.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        task: "prose",
      }),
    );
    expect(chapter.chapterNumber).toBe(3);
    expect(chapter.beats).toHaveLength(4);
    expect(chapter.prompt).toContain(authorDNA.philosophy.coreMessage);
    expect(chapter.prompt).toContain("hook");
    expect(chapter.text).toContain("prose:");
  });

  it("throws when the requested chapter is missing from the plot", async () => {
    const authorDNA = createSampleAuthorDNA();
    const plot = buildPlotArchitecture(authorDNA);

    await expect(
      generateChapter({
        authorDNA,
        plot,
        chapterNumber: 99,
        router: {
          generate: async () => ({ text: "unused", tokensUsed: 0 }),
        },
        characterStates: [],
        foreshadowing: {
          toSeed: [],
          toHint: [],
          toPayoff: [],
        },
        recentSummaries: [],
        relevantMemories: [],
      }),
    ).rejects.toThrow(/chapter 99/i);
  });
});
