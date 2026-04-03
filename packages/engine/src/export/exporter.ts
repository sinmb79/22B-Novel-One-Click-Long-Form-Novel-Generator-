import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { buildEpubArtifact } from "./epub-builder.js";
import { buildMarkdownArtifact, buildJsonArtifact, buildTextArtifact } from "./markdown.js";
import { buildPdfArtifact } from "./pdf-builder.js";

import type { BuildExportArtifactInput, ExportChapter, ExportFormat } from "./types.js";

export interface ExportArtifactInput {
  title: string;
  chapters: ExportChapter[];
  exportsDirectory: string;
  format: ExportFormat;
}

export interface ExportArtifactResult {
  outputPath: string;
  format: ExportFormat;
}

function getOutputFilename(format: ExportFormat): string {
  switch (format) {
    case "markdown":
      return "novel.md";
    case "txt":
      return "novel.txt";
    case "json":
      return "novel.json";
    case "epub":
      return "novel.epub";
    case "pdf":
      return "novel.pdf";
    default:
      return "novel.out";
  }
}

export async function exportArtifact({
  title,
  chapters,
  exportsDirectory,
  format,
}: ExportArtifactInput): Promise<ExportArtifactResult> {
  await mkdir(exportsDirectory, { recursive: true });

  const outputPath = join(exportsDirectory, getOutputFilename(format));
  const input: BuildExportArtifactInput = {
    title,
    chapters,
    outputPath,
  };

  switch (format) {
    case "markdown":
      await buildMarkdownArtifact(input);
      break;
    case "txt":
      await buildTextArtifact(input);
      break;
    case "json":
      await buildJsonArtifact(input);
      break;
    case "epub":
      await buildEpubArtifact(input);
      break;
    case "pdf":
      await buildPdfArtifact(input);
      break;
    default:
      throw new Error(`Unsupported export format: ${format satisfies never}`);
  }

  return {
    outputPath,
    format,
  };
}
