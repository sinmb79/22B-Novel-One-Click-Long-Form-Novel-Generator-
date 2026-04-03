export type SceneType =
  | "battle"
  | "romance"
  | "introspection"
  | "dialogue"
  | "exposition"
  | "climax"
  | "aftermath"
  | "daily-life"
  | "mystery";

export type CharacterRole = "protagonist" | "antagonist" | "supporting" | "minor";
export type VocabularyStyle = "formal" | "casual" | "archaic" | "technical" | "slang";
export type SentenceLength = "short" | "medium" | "long";
export type StyleSentenceLength = "staccato" | "flowing" | "mixed";
export type Pacing = "fast" | "medium" | "slow";
export type PovDistance = "close" | "medium" | "distant";
export type MetaphorDensity = "sparse" | "moderate" | "rich";
export type RelationshipType = "ally" | "rival" | "mentor" | "love" | "enemy" | "family";
export type LanguageCode = "ko" | "en" | "ko+en";
export type WebNovelPlatform = "ridi" | "kakao-page" | "naver-series" | "munpia" | null;

export interface TurningPoint {
  chapter: number;
  event: string;
  change: string;
}

export interface Relationship {
  characterId: string;
  type: RelationshipType;
  dynamic: string;
  evolution: string;
}

export interface CharacterSoul {
  id: string;
  name: string;
  role: CharacterRole;
  personality: {
    bigFive: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    mbti?: string;
    enneagram?: number;
  };
  coreDesire: string;
  coreFear: string;
  trauma?: string;
  values: string[];
  flaw: string;
  speechPattern: {
    vocabulary: VocabularyStyle;
    sentenceLength: SentenceLength;
    quirks: string[];
    innerVoice: string;
  };
  growthArc: {
    startState: string;
    endState: string;
    turningPoints: TurningPoint[];
  };
  relationships: Relationship[];
}

export interface StyleProfile {
  sceneType: SceneType;
  style: {
    sentenceLength: StyleSentenceLength;
    pacing: Pacing;
    sensoryFocus: string[];
    metaphorDensity: MetaphorDensity;
    povDistance: PovDistance;
    toneKeywords: string[];
  };
  sampleText?: string;
}

export interface WorldRule {
  id: string;
  name: string;
  description: string;
  relevantTo: SceneType[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
}

export interface TimelineEvent {
  chapter: number;
  event: string;
}

export interface AuthorDNA {
  philosophy: {
    coreMessage: string;
    neverDo: string[];
    readerFeeling: string;
    thematicKeywords: string[];
  };
  characters: CharacterSoul[];
  styleProfiles: StyleProfile[];
  world: {
    name: string;
    description: string;
    rules: WorldRule[];
    locations: Location[];
    factions?: Faction[];
    timeline: TimelineEvent[];
  };
  meta: {
    genre: string;
    targetLength: number;
    chapterWordCount: number;
    language: LanguageCode;
    webNovelPlatform?: WebNovelPlatform;
  };
}
