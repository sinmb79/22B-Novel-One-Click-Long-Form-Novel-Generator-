import { describe, expect, it } from "vitest";

import { buildPlotArchitecture } from "./architect.js";
import { createSampleAuthorDNA } from "../test/fixtures.js";

describe("buildPlotArchitecture", () => {
  it("creates one chapter plan per target chapter", () => {
    const plot = buildPlotArchitecture(createSampleAuthorDNA());

    expect(plot.chapters).toHaveLength(4);
    expect(plot.chapters[0]?.characters).toContain("protagonist");
    expect(plot.chapters[2]?.notes).toContain("She confesses her role in her mother's death.");
  });

  it("uses provided arc names and custom emotion targets", () => {
    const plot = buildPlotArchitecture(createSampleAuthorDNA(), {
      arcNames: ["Signal", "Weight"],
      emotionCurve: [0.1, 0.3, 0.9, 0.2],
    });

    expect(plot.arcs.map((arc) => arc.name)).toEqual(["Signal", "Weight"]);
    expect(plot.chapters.map((chapter) => chapter.targetTension)).toEqual([0.1, 0.3, 0.9, 0.2]);
  });
});
