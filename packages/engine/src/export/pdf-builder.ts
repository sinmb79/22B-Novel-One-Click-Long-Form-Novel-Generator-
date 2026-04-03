import { writeFile } from "node:fs/promises";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { BuildExportArtifactInput } from "./types.js";

const FONT_SIZE = 12;
const TITLE_SIZE = 22;
const PAGE_MARGIN = 50;
const LINE_HEIGHT = 18;

function wrapText(text: string, maxWidth: number, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, size: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine.length === 0 ? word : `${currentLine} ${word}`;
    const width = font.widthOfTextAtSize(candidate, size);

    if (width <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

export async function buildPdfArtifact({
  title,
  chapters,
  outputPath,
}: BuildExportArtifactInput): Promise<void> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage();
  let { width, height } = page.getSize();
  let cursorY = height - PAGE_MARGIN;

  page.drawText(title, {
    x: PAGE_MARGIN,
    y: cursorY,
    size: TITLE_SIZE,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  cursorY -= TITLE_SIZE + 24;

  for (const chapter of chapters) {
    if (cursorY < PAGE_MARGIN + 80) {
      page = pdf.addPage();
      ({ width, height } = page.getSize());
      cursorY = height - PAGE_MARGIN;
    }

    page.drawText(chapter.title, {
      x: PAGE_MARGIN,
      y: cursorY,
      size: 16,
      font: boldFont,
    });
    cursorY -= 28;

    const paragraphs = chapter.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
    for (const paragraph of paragraphs) {
      const lines = wrapText(paragraph, width - PAGE_MARGIN * 2, font, FONT_SIZE);

      for (const line of lines) {
        if (cursorY < PAGE_MARGIN + LINE_HEIGHT) {
          page = pdf.addPage();
          ({ width, height } = page.getSize());
          cursorY = height - PAGE_MARGIN;
        }

        page.drawText(line, {
          x: PAGE_MARGIN,
          y: cursorY,
          size: FONT_SIZE,
          font,
        });
        cursorY -= LINE_HEIGHT;
      }

      cursorY -= 8;
    }

    cursorY -= 20;
  }

  const bytes = await pdf.save();
  await writeFile(outputPath, Buffer.from(bytes));
}
