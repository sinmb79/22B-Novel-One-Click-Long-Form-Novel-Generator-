import type { ChapterBeat, DecomposeChapterInput } from "./types.js";

export function decomposeChapterToBeats({
  authorDNA,
  chapterPlan,
}: DecomposeChapterInput): ChapterBeat[] {
  const focusCharacterId = chapterPlan.characters[0] ?? authorDNA.characters[0]?.id ?? "unknown";
  const chapterNotes = chapterPlan.notes.join(" ");

  return [
    {
      index: 1,
      label: "opener",
      summary: `Open inside the ${chapterPlan.arcName} arc with a ${chapterPlan.sceneType} beat that foregrounds ${focusCharacterId}.`,
      focusCharacterId,
      targetTension: Number((chapterPlan.targetTension * 0.5).toFixed(2)),
    },
    {
      index: 2,
      label: "complication",
      summary: `Complicate the chapter goal and expose friction around ${authorDNA.philosophy.thematicKeywords[0] ?? "identity"}.`,
      focusCharacterId,
      targetTension: Number((chapterPlan.targetTension * 0.8).toFixed(2)),
    },
    {
      index: 3,
      label: "turn",
      summary: chapterNotes
        ? `Trigger the chapter turn through this note: ${chapterNotes}`
        : `Trigger a decisive turn that deepens the ${chapterPlan.arcName} arc.`,
      focusCharacterId,
      targetTension: Number(chapterPlan.targetTension.toFixed(2)),
    },
    {
      index: 4,
      label: "hook",
      summary: `End on a hook that makes the reader chase chapter ${chapterPlan.chapterNumber + 1}.`,
      focusCharacterId,
      targetTension: Number(Math.min(1, chapterPlan.targetTension + 0.1).toFixed(2)),
    },
  ];
}
