import type { AuthorDNA } from "@22b/engine";

import type { GenrePreset } from "../types.js";

function createStyleProfile(
  sceneType: AuthorDNA["styleProfiles"][number]["sceneType"],
  style: AuthorDNA["styleProfiles"][number]["style"],
): AuthorDNA["styleProfiles"][number] {
  return { sceneType, style };
}

export const GENRE_PRESETS: Record<string, GenrePreset> = {
  "로맨스사극": {
    id: "romance-historical",
    name: "로맨스사극",
    conventions: {
      pacing: "초반 진입이 빠르고, 3화 간격으로 감정 훅을 배치한다.",
      hookFrequency: 3,
      typicalArcs: 4,
      readerExpectations: ["신분 갈등", "궁중 암투", "비밀스러운 만남", "위기 속 구출"],
    },
    styleProfiles: [
      createStyleProfile("romance", {
        sentenceLength: "flowing",
        pacing: "slow",
        sensoryFocus: ["시각", "촉각", "향기"],
        metaphorDensity: "rich",
        povDistance: "close",
        toneKeywords: ["애틋한", "긴장되는"],
      }),
      createStyleProfile("introspection", {
        sentenceLength: "flowing",
        pacing: "slow",
        sensoryFocus: ["내면", "촉각"],
        metaphorDensity: "rich",
        povDistance: "close",
        toneKeywords: ["고독한", "결연한"],
      }),
      createStyleProfile("dialogue", {
        sentenceLength: "mixed",
        pacing: "medium",
        sensoryFocus: ["대사"],
        metaphorDensity: "moderate",
        povDistance: "close",
        toneKeywords: ["예민한", "밀도 있는"],
      }),
    ],
    characterArchetypes: ["궁녀", "왕자", "정적", "조력자"],
    emotionCurveTemplate: "web-novel",
  },
  판타지: {
    id: "fantasy",
    name: "판타지",
    conventions: {
      pacing: "세계 소개 후 빠르게 임무와 위협을 드러낸다.",
      hookFrequency: 4,
      typicalArcs: 5,
      readerExpectations: ["세계관 규칙", "성장", "파티 시너지", "거대한 위협"],
    },
    styleProfiles: [
      createStyleProfile("exposition", {
        sentenceLength: "flowing",
        pacing: "medium",
        sensoryFocus: ["시각", "공간"],
        metaphorDensity: "moderate",
        povDistance: "medium",
        toneKeywords: ["장엄한", "신비로운"],
      }),
      createStyleProfile("battle", {
        sentenceLength: "staccato",
        pacing: "fast",
        sensoryFocus: ["시각", "소리", "충격"],
        metaphorDensity: "sparse",
        povDistance: "close",
        toneKeywords: ["폭발적인", "긴박한"],
      }),
      createStyleProfile("climax", {
        sentenceLength: "mixed",
        pacing: "fast",
        sensoryFocus: ["시각", "통증"],
        metaphorDensity: "moderate",
        povDistance: "close",
        toneKeywords: ["압도적인", "격렬한"],
      }),
    ],
    characterArchetypes: ["모험가", "마법사", "기사", "라이벌"],
    emotionCurveTemplate: "heroic",
  },
  SF: {
    id: "sf",
    name: "SF",
    conventions: {
      pacing: "아이디어를 빠르게 제시하고, 사건으로 의미를 증명한다.",
      hookFrequency: 4,
      typicalArcs: 4,
      readerExpectations: ["기술 규칙", "윤리적 딜레마", "확장되는 미스터리"],
    },
    styleProfiles: [
      createStyleProfile("mystery", {
        sentenceLength: "mixed",
        pacing: "medium",
        sensoryFocus: ["시각", "데이터"],
        metaphorDensity: "sparse",
        povDistance: "close",
        toneKeywords: ["이질적인", "불길한"],
      }),
      createStyleProfile("exposition", {
        sentenceLength: "mixed",
        pacing: "medium",
        sensoryFocus: ["시각", "개념"],
        metaphorDensity: "moderate",
        povDistance: "medium",
        toneKeywords: ["정교한", "냉정한"],
      }),
      createStyleProfile("introspection", {
        sentenceLength: "flowing",
        pacing: "slow",
        sensoryFocus: ["내면", "촉각"],
        metaphorDensity: "moderate",
        povDistance: "close",
        toneKeywords: ["쓸쓸한", "철학적인"],
      }),
    ],
    characterArchetypes: ["엔지니어", "파일럿", "연구자", "감시자"],
    emotionCurveTemplate: "cerebral",
  },
  스릴러: {
    id: "thriller",
    name: "스릴러",
    conventions: {
      pacing: "정보는 지연시키고 위협은 앞당긴다.",
      hookFrequency: 3,
      typicalArcs: 4,
      readerExpectations: ["반전", "시간 압박", "오판", "진실 추적"],
    },
    styleProfiles: [
      createStyleProfile("mystery", {
        sentenceLength: "staccato",
        pacing: "fast",
        sensoryFocus: ["소리", "시각"],
        metaphorDensity: "sparse",
        povDistance: "close",
        toneKeywords: ["불안한", "차가운"],
      }),
      createStyleProfile("dialogue", {
        sentenceLength: "staccato",
        pacing: "fast",
        sensoryFocus: ["대사"],
        metaphorDensity: "sparse",
        povDistance: "close",
        toneKeywords: ["날 선", "의심스러운"],
      }),
      createStyleProfile("climax", {
        sentenceLength: "staccato",
        pacing: "fast",
        sensoryFocus: ["시각", "통증"],
        metaphorDensity: "sparse",
        povDistance: "close",
        toneKeywords: ["긴박한", "폭력적인"],
      }),
    ],
    characterArchetypes: ["추적자", "피해자", "용의자", "조력자"],
    emotionCurveTemplate: "suspense",
  },
  회귀물: {
    id: "regression",
    name: "회귀물",
    conventions: {
      pacing: "초반에 실패의 기억과 재도전 전략을 바로 제시한다.",
      hookFrequency: 3,
      typicalArcs: 5,
      readerExpectations: ["미래 지식 활용", "재도전", "성장 루프", "복수 혹은 구원"],
    },
    styleProfiles: [
      createStyleProfile("introspection", {
        sentenceLength: "mixed",
        pacing: "medium",
        sensoryFocus: ["내면"],
        metaphorDensity: "moderate",
        povDistance: "close",
        toneKeywords: ["절박한", "결연한"],
      }),
      createStyleProfile("dialogue", {
        sentenceLength: "mixed",
        pacing: "fast",
        sensoryFocus: ["대사"],
        metaphorDensity: "sparse",
        povDistance: "close",
        toneKeywords: ["노련한", "숨기는"],
      }),
      createStyleProfile("climax", {
        sentenceLength: "mixed",
        pacing: "fast",
        sensoryFocus: ["시각", "통증"],
        metaphorDensity: "sparse",
        povDistance: "close",
        toneKeywords: ["통쾌한", "날카로운"],
      }),
    ],
    characterArchetypes: ["회귀자", "조력자", "적대자", "숨은 흑막"],
    emotionCurveTemplate: "web-novel",
  },
  일반: {
    id: "general",
    name: "일반",
    conventions: {
      pacing: "주제와 갈등을 3화 안에 명확히 세운다.",
      hookFrequency: 4,
      typicalArcs: 4,
      readerExpectations: ["명확한 갈등", "정서적 보상", "다음 화 동력"],
    },
    styleProfiles: [
      createStyleProfile("dialogue", {
        sentenceLength: "mixed",
        pacing: "medium",
        sensoryFocus: ["대사", "시각"],
        metaphorDensity: "moderate",
        povDistance: "close",
        toneKeywords: ["명료한", "흡입력 있는"],
      }),
      createStyleProfile("introspection", {
        sentenceLength: "flowing",
        pacing: "slow",
        sensoryFocus: ["내면"],
        metaphorDensity: "moderate",
        povDistance: "close",
        toneKeywords: ["차분한", "섬세한"],
      }),
    ],
    characterArchetypes: ["주인공", "조력자", "라이벌", "적대자"],
    emotionCurveTemplate: "web-novel",
  },
};

export function normalizeGenreKey(genre: string): string {
  const trimmed = genre.trim();
  return GENRE_PRESETS[trimmed] ? trimmed : "일반";
}

export function getGenrePreset(genre?: string): GenrePreset {
  if (!genre) {
    return GENRE_PRESETS.일반;
  }

  return GENRE_PRESETS[normalizeGenreKey(genre)] ?? GENRE_PRESETS.일반;
}
