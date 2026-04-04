import type { AuthorDNA } from "@22b/engine";

const STYLE_OVERRIDES: Record<string, Partial<AuthorDNA["styleProfiles"][number]["style"]>> = {
  "웹소설체": {
    pacing: "fast",
    metaphorDensity: "sparse",
  },
  문학체: {
    pacing: "slow",
    metaphorDensity: "rich",
  },
  "라이트노벨체": {
    pacing: "medium",
    povDistance: "close",
  },
  하드보일드: {
    pacing: "fast",
    sentenceLength: "staccato",
    metaphorDensity: "sparse",
  },
};

export function applyStyleOverride(
  styleProfiles: AuthorDNA["styleProfiles"],
  styleName?: string,
): AuthorDNA["styleProfiles"] {
  if (!styleName || !STYLE_OVERRIDES[styleName]) {
    return styleProfiles;
  }

  const override = STYLE_OVERRIDES[styleName];

  return styleProfiles.map((profile) => ({
    ...profile,
    style: {
      ...profile.style,
      ...override,
    },
  }));
}
