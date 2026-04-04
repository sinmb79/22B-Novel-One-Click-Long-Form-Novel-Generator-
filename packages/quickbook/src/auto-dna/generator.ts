import { parseAuthorDNA } from "@22b/engine";

import { createFallbackCharacters } from "./character-gen.js";
import { getGenrePreset } from "./genre-presets.js";
import { applyStyleOverride } from "./style-matcher.js";
import { createFallbackWorld } from "./world-gen.js";

import type { ProcessedReference } from "../types.js";
import type { ChapterGeneratorRouter } from "@22b/engine";

function extractJsonBlock(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

function inferGenreFromTopic(topic: string): string {
  const rules: Array<{ genre: string; patterns: RegExp[] }> = [
    { genre: "로맨스사극", patterns: [/궁녀|조선|왕실|사극|후궁/u] },
    { genre: "회귀물", patterns: [/회귀|다시\s*살|타임루프|되돌아/u] },
    { genre: "SF", patterns: [/AI|우주|204\d|로봇|사이버|의식/u] },
    { genre: "스릴러", patterns: [/살인|추적|범인|감금|복수/u] },
    { genre: "판타지", patterns: [/마법|용|왕국|던전|정령/u] },
  ];

  const matched = rules.find((rule) => rule.patterns.some((pattern) => pattern.test(topic)));
  return matched?.genre ?? "일반";
}

export async function inferGenre(
  topic: string,
  router: Pick<ChapterGeneratorRouter, "generate">,
): Promise<string> {
  const heuristic = inferGenreFromTopic(topic);

  if (heuristic !== "일반") {
    return heuristic;
  }

  try {
    const result = await router.generate({
      task: "qa",
      prompt: [
        "Pick the best genre label for the topic from this list:",
        "로맨스사극, 판타지, SF, 스릴러, 회귀물, 일반",
        "",
        topic,
      ].join("\n"),
    });
    const genre = result.text.trim();

    return getGenrePreset(genre).name;
  } catch {
    return "일반";
  }
}

function buildFallbackAuthorDNA(input: {
  topic: string;
  processedRefs: ProcessedReference | null;
  genre: string;
  style: string;
  chapters: number;
  language: "ko" | "en";
  chapterWordCount: number;
}) {
  const preset = getGenrePreset(input.genre);
  const styleProfiles = applyStyleOverride(preset.styleProfiles, input.style);

  return parseAuthorDNA({
    philosophy: {
      coreMessage: `${input.topic} 속에서 사람은 무엇을 지키며 살아남는가.`,
      neverDo: ["맥락 없는 잔혹함을 미화하지 않는다.", "주인공의 선택을 쉽게 면죄하지 않는다."],
      readerFeeling: "끝까지 버틴 끝에 얻는 해방감과 여운",
      thematicKeywords: ["생존", "선택", "대가", input.topic],
    },
    characters: createFallbackCharacters({
      topic: input.topic,
      chapters: input.chapters,
      preset,
      language: input.language,
    }),
    styleProfiles,
    world: createFallbackWorld({
      topic: input.topic,
      preset,
      chapters: input.chapters,
      summary: input.processedRefs?.summary,
    }),
    meta: {
      genre: preset.name,
      targetLength: input.chapters,
      chapterWordCount: input.chapterWordCount,
      language: input.language,
    },
  });
}

export async function generateAuthorDNA(input: {
  topic: string;
  processedRefs: ProcessedReference | null;
  genre: string;
  style: string;
  chapters: number;
  language: "ko" | "en";
  chapterWordCount: number;
  router: Pick<ChapterGeneratorRouter, "generate">;
}) {
  const preset = getGenrePreset(input.genre);
  const prompt = [
    `You are designing a long-form ${preset.name} novel bible.`,
    `Return JSON only that matches the 22B AuthorDNA shape.`,
    `Use "genre": "${preset.name}" and "targetLength": ${input.chapters} in meta.`,
    `Use chapterWordCount ${input.chapterWordCount} and language "${input.language}".`,
    "",
    "Topic:",
    input.topic,
    "",
    input.processedRefs?.summary ? `Reference summary:\n${input.processedRefs.summary}\n` : "",
    "Reader expectations:",
    preset.conventions.readerExpectations.join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await input.router.generate({
      task: "plot",
      prompt,
    });
    const jsonText = extractJsonBlock(result.text);

    if (jsonText) {
      const parsed = parseAuthorDNA(JSON.parse(jsonText));

      return {
        authorDNA: {
          ...parsed,
          styleProfiles: applyStyleOverride(parsed.styleProfiles, input.style),
          meta: {
            ...parsed.meta,
            genre: preset.name,
            targetLength: input.chapters,
            chapterWordCount: input.chapterWordCount,
            language: input.language,
          },
        },
        prompt,
        responseText: result.text,
        usedFallback: false,
      };
    }
  } catch {
    // Fall through to the deterministic builder.
  }

  const authorDNA = buildFallbackAuthorDNA(input);

  return {
    authorDNA,
    prompt,
    responseText: JSON.stringify(authorDNA),
    usedFallback: true,
  };
}
