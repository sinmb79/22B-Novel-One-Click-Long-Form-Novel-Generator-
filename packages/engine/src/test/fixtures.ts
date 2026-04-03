import { parseAuthorDNA } from "../author-dna/manager.js";

export function createSampleAuthorDNA() {
  return parseAuthorDNA({
    philosophy: {
      coreMessage: "Power without conscience destroys the self.",
      neverDo: ["Glorify cruelty without consequence"],
      readerFeeling: "Lingering ache with cautious hope",
      thematicKeywords: ["identity", "memory", "power"],
    },
    characters: [
      {
        id: "protagonist",
        name: "Seo Yoon",
        role: "protagonist",
        personality: {
          bigFive: {
            openness: 88,
            conscientiousness: 72,
            extraversion: 41,
            agreeableness: 63,
            neuroticism: 54,
          },
          mbti: "INFJ",
          enneagram: 1,
        },
        coreDesire: "To rescue her brother from a memory prison.",
        coreFear: "Becoming the same monster she hunts.",
        trauma: "She erased her mother's last memory by accident.",
        values: ["mercy", "truth"],
        flaw: "She withholds critical truth when afraid.",
        speechPattern: {
          vocabulary: "formal",
          sentenceLength: "medium",
          quirks: ["rarely uses contractions"],
          innerVoice: "Measured, guilty, and visually observant.",
        },
        growthArc: {
          startState: "Controlled but emotionally numb.",
          endState: "Openly vulnerable and willing to trust others.",
          turningPoints: [
            {
              chapter: 3,
              event: "She confesses her role in her mother's death.",
              change: "Stops hiding behind pure competence.",
            },
          ],
        },
        relationships: [
          {
            characterId: "mentor",
            type: "mentor",
            dynamic: "Mutual respect with concealed resentment.",
            evolution: "Becomes open defiance by the midpoint.",
          },
        ],
      },
      {
        id: "mentor",
        name: "Han Mir",
        role: "supporting",
        personality: {
          bigFive: {
            openness: 61,
            conscientiousness: 90,
            extraversion: 38,
            agreeableness: 46,
            neuroticism: 30,
          },
        },
        coreDesire: "Keep the city stable no matter the cost.",
        coreFear: "That mercy will collapse the archive order.",
        values: ["order", "duty"],
        flaw: "He confuses restraint with wisdom.",
        speechPattern: {
          vocabulary: "formal",
          sentenceLength: "long",
          quirks: ["answers questions with questions"],
          innerVoice: "Cold, strategic, and defensive.",
        },
        growthArc: {
          startState: "Aloof guardian of the old order.",
          endState: "Forced to admit the system is broken.",
          turningPoints: [],
        },
        relationships: [],
      },
    ],
    styleProfiles: [
      {
        sceneType: "introspection",
        style: {
          sentenceLength: "flowing",
          pacing: "slow",
          sensoryFocus: ["sound", "touch"],
          metaphorDensity: "moderate",
          povDistance: "close",
          toneKeywords: ["haunting", "intimate"],
        },
        sampleText: "The corridor breathed like an old lung.",
      },
      {
        sceneType: "mystery",
        style: {
          sentenceLength: "mixed",
          pacing: "medium",
          sensoryFocus: ["sight", "sound"],
          metaphorDensity: "sparse",
          povDistance: "close",
          toneKeywords: ["curious", "uneasy"],
        },
      },
    ],
    world: {
      name: "The Archive Sea",
      description: "A flooded megacity where memories are harvested as fuel.",
      rules: [
        {
          id: "memory-trade",
          name: "Memory Trade",
          description: "Memories can be extracted but never perfectly restored.",
          relevantTo: ["introspection", "mystery"],
        },
      ],
      locations: [
        {
          id: "lower-harbor",
          name: "Lower Harbor",
          description: "Markets built on rusted ferry decks.",
        },
      ],
      factions: [
        {
          id: "curators",
          name: "The Curators",
          description: "Archivists who regulate the city's memory trade.",
        },
      ],
      timeline: [
        {
          chapter: 1,
          event: "The tidewall breaks and exposes sealed vaults.",
        },
      ],
    },
    meta: {
      genre: "philosophical sf",
      targetLength: 4,
      chapterWordCount: 3000,
      language: "ko",
      webNovelPlatform: "munpia",
    },
  });
}
