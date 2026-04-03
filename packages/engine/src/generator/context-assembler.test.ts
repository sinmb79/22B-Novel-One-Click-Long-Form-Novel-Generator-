import { describe, expect, it } from "vitest";

import { buildPlotArchitecture } from "../plot/architect.js";
import { assembleChapterContext } from "./context-assembler.js";
import { createSampleAuthorDNA } from "../test/fixtures.js";

describe("assembleChapterContext", () => {
  it("selects the matching style profile and relevant world rules", () => {
    const authorDNA = createSampleAuthorDNA();
    const chapterPlan = buildPlotArchitecture(authorDNA).chapters[2];

    const context = assembleChapterContext({
      authorDNA,
      chapterPlan: chapterPlan!,
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

    expect(context.styleProfile.sceneType).toBe(chapterPlan?.sceneType);
    expect(context.worldRules).toHaveLength(1);
    expect(context.foreshadowing.toHint).toContain("The tidewall hum changes");
  });

  it("falls back to the first style profile when the scene type is missing", () => {
    const authorDNA = createSampleAuthorDNA();
    const chapterPlan = {
      ...buildPlotArchitecture(authorDNA).chapters[0]!,
      sceneType: "dialogue" as const,
    };

    const context = assembleChapterContext({
      authorDNA,
      chapterPlan,
      characterStates: [],
      foreshadowing: {
        toSeed: [],
        toHint: [],
        toPayoff: [],
      },
      recentSummaries: [],
      relevantMemories: [],
    });

    expect(context.styleProfile.sceneType).toBe(authorDNA.styleProfiles[0]?.sceneType);
  });
});
