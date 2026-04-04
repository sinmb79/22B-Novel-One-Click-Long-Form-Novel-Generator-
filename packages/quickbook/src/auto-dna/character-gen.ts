import type { AuthorDNA } from "@22b/engine";

import type { GenrePreset } from "../types.js";

const KOREAN_NAMES = [
  "서윤",
  "도현",
  "하린",
  "유진",
  "시우",
  "연화",
  "재윤",
];

const ENGLISH_NAMES = [
  "Mina",
  "Rowan",
  "Elio",
  "Sera",
  "Juno",
  "Iris",
  "Noah",
];

function pickNames(language: "ko" | "en", count: number): string[] {
  const source = language === "en" ? ENGLISH_NAMES : KOREAN_NAMES;
  return source.slice(0, count);
}

export function createFallbackCharacters(input: {
  topic: string;
  chapters: number;
  preset: GenrePreset;
  language: "ko" | "en";
}): AuthorDNA["characters"] {
  const names = pickNames(input.language, 4);
  const archetypes = input.preset.characterArchetypes;

  return names.map((name, index) => ({
    id: `char_${String(index + 1).padStart(3, "0")}`,
    name,
    role:
      index === 0
        ? "protagonist"
        : index === 1
          ? "antagonist"
          : "supporting",
    personality: {
      bigFive: {
        openness: 60 + index * 6,
        conscientiousness: 52 + index * 5,
        extraversion: 48 + index * 4,
        agreeableness: index === 1 ? 35 : 58,
        neuroticism: index === 0 ? 62 : 45,
      },
    },
    coreDesire:
      index === 0
        ? `${input.topic} 속에서 자기 운명을 바꾼다.`
        : `${names[0]}의 선택을 꺾고 주도권을 가져온다.`,
    coreFear:
      index === 0
        ? "지금의 결단이 모두를 파멸시킬까 두렵다."
        : "통제력을 잃고 약한 모습을 드러내는 것을 두려워한다.",
    trauma:
      index === 0 ? "가장 중요한 사람을 지키지 못한 기억이 남아 있다." : undefined,
    values:
      index === 0 ? ["생존", "진실", "책임"] : ["권력", "통제", "명예"],
    flaw:
      index === 0
        ? "모든 짐을 혼자 짊어지려 한다."
        : "사람을 도구로 다루는 습관을 버리지 못한다.",
    speechPattern: {
      vocabulary: index === 1 ? "formal" : "casual",
      sentenceLength: index % 2 === 0 ? "medium" : "short",
      quirks: [`${archetypes[index] ?? "조력자"}다운 은유를 자주 쓴다.`],
      innerVoice:
        index === 0
          ? "감정과 계산이 동시에 달리는 내면 독백."
          : "숨긴 의도를 정리하는 차가운 내면 독백.",
    },
    growthArc: {
      startState:
        index === 0
          ? "불안하지만 움직일 수밖에 없는 상태"
          : "자신의 방식이 옳다고 확신하는 상태",
      endState:
        index === 0
          ? "타인과 연대하며 더 큰 결단을 감당하는 상태"
          : "통제보다 진실이 중요함을 받아들이는 상태",
      turningPoints: [
        {
          chapter: Math.max(2, Math.floor(input.chapters * 0.35)),
          event: `${name}의 믿음을 뒤집는 사건`,
          change: "관계의 방향이 크게 바뀐다.",
        },
        {
          chapter: Math.max(3, Math.floor(input.chapters * 0.75)),
          event: `${name}이 감추던 진심을 드러낸다.`,
          change: "최종 결단의 동기가 선명해진다.",
        },
      ],
    },
    relationships: [],
  }));
}
