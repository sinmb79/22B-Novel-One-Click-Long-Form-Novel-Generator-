export type ExportFormat = "markdown" | "txt" | "json" | "epub" | "pdf";

export interface ExportChapter {
  chapterNumber: number;
  title: string;
  body: string;
}

export interface BuildExportArtifactInput {
  title: string;
  chapters: ExportChapter[];
  outputPath: string;
}
