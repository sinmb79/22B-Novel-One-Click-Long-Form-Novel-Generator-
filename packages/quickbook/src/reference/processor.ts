import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import type { ChapterGeneratorRouter } from "@22b/engine";

import { extractTextFromPdf } from "./pdf-extractor.js";
import { createLightweightEmbedding, chunkReferenceText } from "./ref-embedder.js";
import { summarizeReferenceTexts } from "./text-summarizer.js";
import { extractTextFromUrl } from "./url-extractor.js";

import type { ProcessedReference, ReferenceInput } from "../types.js";

async function extractTextFromFile(path: string): Promise<string> {
  const absolutePath = resolve(path);
  const extension = extname(absolutePath).toLowerCase();

  if (extension === ".pdf") {
    return extractTextFromPdf(absolutePath);
  }

  const text = await readFile(absolutePath, "utf8");
  return text.replace(/^\uFEFF+/, "").trim();
}

async function extractReferenceText(
  reference: ReferenceInput,
  fetchImpl?: typeof fetch,
): Promise<string> {
  if (reference.type === "text") {
    return reference.value.trim();
  }

  if (reference.type === "url") {
    return extractTextFromUrl(reference.value, fetchImpl);
  }

  return extractTextFromFile(reference.value);
}

export async function processReferences(
  references: ReferenceInput[],
  router: Pick<ChapterGeneratorRouter, "generate">,
  fetchImpl?: typeof fetch,
): Promise<ProcessedReference> {
  const rawTexts = await Promise.all(
    references.map((reference) => extractReferenceText(reference, fetchImpl)),
  );
  const combined = rawTexts.join("\n\n");
  const chunks = chunkReferenceText(combined);
  const embeddings = chunks.map((chunk) => createLightweightEmbedding(chunk));
  const { summary } = await summarizeReferenceTexts(rawTexts, router);

  return {
    rawTexts,
    summary,
    chunks,
    embeddings,
    sources: references.map((reference) => reference.label ?? reference.value),
  };
}
