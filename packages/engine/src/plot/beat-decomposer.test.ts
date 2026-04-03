import { describe, expect, it } from "vitest";

import { buildPlotArchitecture } from "./architect.js";
import { decomposeChapterToBeats } from "./beat-decomposer.js";
import { createSampleAuthorDNA } from "../test/fixtures.js";

describe("decomposeChapterToBeats", () => {
  it("creates a four-beat chapter outline", () => {
    const authorDNA = createSampleAuthorDNA();
    const chapterPlan = buildPlotArchitecture(authorDNA).chapters[0];

    expect(chapterPlan).toBeDefined();

    const beats = decomposeChapterToBeats({
      authorDNA,
      chapterPlan: chapterPlan!,
    });

    expect(beats).toHaveLength(4);
    expect(beats.at(-1)?.label).toBe("hook");
  });

  it("threads chapter notes into the beat outline", () => {
    const authorDNA = createSampleAuthorDNA();
    const chapterPlan = buildPlotArchitecture(authorDNA).chapters[2];

    const beats = decomposeChapterToBeats({
      authorDNA,
      chapterPlan: chapterPlan!,
    });

    expect(beats.some((beat) => beat.summary.includes("She confesses her role in her mother's death."))).toBe(true);
  });
});
