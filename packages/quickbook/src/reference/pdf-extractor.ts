import { readFile } from "node:fs/promises";

export async function extractTextFromPdf(path: string): Promise<string> {
  const buffer = await readFile(path);
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = pdfParseModule.default;
  const parsed = await pdfParse(buffer);

  return parsed.text.replace(/\s+\n/g, "\n").trim();
}
