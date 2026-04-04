import { createSampleAuthorDNA } from "../../../engine/src/test/fixtures.js";

import type { AuthorDNA } from "@22b/engine";

function buildAuthorDNA(targetLength: number, genre: string): AuthorDNA {
  const dna = createSampleAuthorDNA();

  return {
    ...dna,
    meta: {
      ...dna.meta,
      genre,
      targetLength,
    },
  };
}

export function createQuickBookTestRouter() {
  return {
    async generate({ task, prompt }: { task: string; prompt: string }) {
      if (task === "plot") {
        const chapterMatch = prompt.match(/"targetLength":\s*(\d+)/);
        const genreMatch = prompt.match(/"genre":\s*"([^"]+)"/);
        const targetLength = chapterMatch ? Number(chapterMatch[1]) : 3;
        const genre = genreMatch?.[1] ?? "general";

        return {
          text: JSON.stringify(buildAuthorDNA(targetLength, genre)),
          tokensUsed: 600,
        };
      }

      if (task === "qa") {
        return {
          text: "Reference summary: court etiquette, palace hierarchy, survival pressure.",
          tokensUsed: 220,
        };
      }

      return {
        text: `Generated(prose) ${prompt.slice(0, 120)}`,
        tokensUsed: 480,
      };
    },
  };
}

export function createFallbackQuickBookRouter() {
  return {
    async generate({ task, prompt }: { task: string; prompt: string }) {
      if (task === "prose") {
        return {
          text: `Generated(prose) ${prompt.slice(0, 120)}`,
          tokensUsed: 480,
        };
      }

      return {
        text: "not-json-response",
        tokensUsed: 180,
      };
    },
  };
}
