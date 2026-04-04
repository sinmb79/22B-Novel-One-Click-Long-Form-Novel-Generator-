import type { AuthorDNA } from "@22b/engine";

import type { GenrePreset } from "../types.js";

export function createFallbackWorld(input: {
  topic: string;
  preset: GenrePreset;
  chapters: number;
  summary?: string;
}): AuthorDNA["world"] {
  return {
    name: `${input.topic} 세계`,
    description: input.summary?.slice(0, 240) || `${input.topic}를 중심으로 움직이는 세계.`,
    rules: [
      {
        id: "rule-001",
        name: "갈등의 대가",
        description: "모든 선택은 관계나 권력의 비용을 남긴다.",
        relevantTo: ["dialogue", "introspection", "climax"],
      },
      {
        id: "rule-002",
        name: "장르 관습",
        description: input.preset.conventions.readerExpectations.join(", "),
        relevantTo: ["mystery", "battle", "romance", "climax"],
      },
    ],
    locations: [
      {
        id: "location-001",
        name: "첫 무대",
        description: `${input.topic}의 갈등이 시작되는 중심 공간.`,
      },
      {
        id: "location-002",
        name: "금지된 장소",
        description: "주인공이 후반부에 반드시 마주할 위험 지대.",
      },
    ],
    timeline: [
      {
        chapter: 1,
        event: `${input.topic}의 핵심 갈등이 발화한다.`,
      },
      {
        chapter: Math.max(2, Math.floor(input.chapters * 0.5)),
        event: "중반 반전이 발생해 목표가 재정의된다.",
      },
      {
        chapter: Math.max(3, Math.floor(input.chapters * 0.85)),
        event: "최종 대가를 치르는 결전이 열린다.",
      },
    ],
  };
}
