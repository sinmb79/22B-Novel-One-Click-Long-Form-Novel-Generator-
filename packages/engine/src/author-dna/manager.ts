import { z } from "zod";

import type { AuthorDNA } from "./types.js";

const sceneTypeSchema = z.enum([
  "battle",
  "romance",
  "introspection",
  "dialogue",
  "exposition",
  "climax",
  "aftermath",
  "daily-life",
  "mystery"
]);

const percentSchema = z.number().min(0).max(100);

const characterSoulSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["protagonist", "antagonist", "supporting", "minor"]),
  personality: z.object({
    bigFive: z.object({
      openness: percentSchema,
      conscientiousness: percentSchema,
      extraversion: percentSchema,
      agreeableness: percentSchema,
      neuroticism: percentSchema
    }),
    mbti: z.string().min(1).optional(),
    enneagram: z.number().int().min(1).max(9).optional()
  }),
  coreDesire: z.string().min(1),
  coreFear: z.string().min(1),
  trauma: z.string().min(1).optional(),
  values: z.array(z.string().min(1)).min(1),
  flaw: z.string().min(1),
  speechPattern: z.object({
    vocabulary: z.enum(["formal", "casual", "archaic", "technical", "slang"]),
    sentenceLength: z.enum(["short", "medium", "long"]),
    quirks: z.array(z.string().min(1)),
    innerVoice: z.string().min(1)
  }),
  growthArc: z.object({
    startState: z.string().min(1),
    endState: z.string().min(1),
    turningPoints: z.array(
      z.object({
        chapter: z.number().int().positive(),
        event: z.string().min(1),
        change: z.string().min(1)
      }),
    )
  }),
  relationships: z.array(
    z.object({
      characterId: z.string().min(1),
      type: z.enum(["ally", "rival", "mentor", "love", "enemy", "family"]),
      dynamic: z.string().min(1),
      evolution: z.string().min(1)
    }),
  )
});

const styleProfileSchema = z.object({
  sceneType: sceneTypeSchema,
  style: z.object({
    sentenceLength: z.enum(["staccato", "flowing", "mixed"]),
    pacing: z.enum(["fast", "medium", "slow"]),
    sensoryFocus: z.array(z.string().min(1)).min(1),
    metaphorDensity: z.enum(["sparse", "moderate", "rich"]),
    povDistance: z.enum(["close", "medium", "distant"]),
    toneKeywords: z.array(z.string().min(1)).min(1)
  }),
  sampleText: z.string().min(1).optional()
});

const authorDnaSchema = z.object({
  philosophy: z.object({
    coreMessage: z.string().min(1),
    neverDo: z.array(z.string().min(1)),
    readerFeeling: z.string().min(1),
    thematicKeywords: z.array(z.string().min(1)).min(1)
  }),
  characters: z.array(characterSoulSchema).min(1),
  styleProfiles: z.array(styleProfileSchema).min(1),
  world: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    rules: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        description: z.string().min(1),
        relevantTo: z.array(sceneTypeSchema).min(1)
      }),
    ),
    locations: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        description: z.string().min(1)
      }),
    ),
    factions: z
      .array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          description: z.string().min(1)
        }),
      )
      .optional(),
    timeline: z.array(
      z.object({
        chapter: z.number().int().positive(),
        event: z.string().min(1)
      }),
    )
  }),
  meta: z.object({
    genre: z.string().min(1),
    targetLength: z.number().int().positive(),
    chapterWordCount: z.number().int().positive(),
    language: z.enum(["ko", "en", "ko+en"]),
    webNovelPlatform: z.enum(["ridi", "kakao-page", "naver-series", "munpia"]).nullable().optional()
  })
});

function formatSchemaErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
    .join("; ");
}

export function parseAuthorDNA(input: unknown): AuthorDNA {
  const result = authorDnaSchema.safeParse(input);

  if (!result.success) {
    throw new Error(formatSchemaErrors(result.error));
  }

  return result.data as AuthorDNA;
}

export { authorDnaSchema as AuthorDNASchema };
