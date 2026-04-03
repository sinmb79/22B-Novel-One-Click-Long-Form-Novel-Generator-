import { writeFile } from "node:fs/promises";

import type { BuildExportArtifactInput } from "./types.js";

export async function buildMarkdownArtifact({
  title,
  chapters,
  outputPath,
}: BuildExportArtifactInput): Promise<void> {
  const document = [
    `# ${title}`,
    ...chapters.map((chapter) => `## ${chapter.title}\n\n${chapter.body}`),
  ].join("\n\n");

  await writeFile(outputPath, `${document}\n`, "utf8");
}

export async function buildTextArtifact({
  title,
  chapters,
  outputPath,
}: BuildExportArtifactInput): Promise<void> {
  const document = [
    title.toUpperCase(),
    ...chapters.map((chapter) => `${chapter.title}\n\n${chapter.body}`),
  ].join("\n\n");

  await writeFile(outputPath, `${document}\n`, "utf8");
}

export async function buildJsonArtifact({
  title,
  chapters,
  outputPath,
}: BuildExportArtifactInput): Promise<void> {
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        title,
        chapters,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}
