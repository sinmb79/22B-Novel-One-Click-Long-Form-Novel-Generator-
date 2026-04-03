import { writeFile } from "node:fs/promises";

import JSZip from "jszip";

import type { BuildExportArtifactInput } from "./types.js";

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildChapterXhtml(title: string, body: string): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeXml(paragraph)}</p>`)
    .join("\n      ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>${escapeXml(title)}</title>
  </head>
  <body>
    <h1>${escapeXml(title)}</h1>
      ${paragraphs}
  </body>
</html>
`;
}

export async function buildEpubArtifact({
  title,
  chapters,
  outputPath,
}: BuildExportArtifactInput): Promise<void> {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`,
  );

  const manifestItems = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    ...chapters.map(
      (chapter) =>
        `<item id="chapter-${chapter.chapterNumber}" href="chapter-${String(chapter.chapterNumber).padStart(3, "0")}.xhtml" media-type="application/xhtml+xml"/>`,
    ),
  ].join("\n    ");
  const spineItems = chapters
    .map((chapter) => `<itemref idref="chapter-${chapter.chapterNumber}"/>`)
    .join("\n    ");

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${escapeXml(title.toLowerCase().replaceAll(/\s+/g, "-"))}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>ko</dc:language>
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine>
    ${spineItems}
  </spine>
</package>
`,
  );
  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>${escapeXml(title)}</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>${escapeXml(title)}</h1>
      <ol>
        ${chapters
          .map(
            (chapter) =>
              `<li><a href="chapter-${String(chapter.chapterNumber).padStart(3, "0")}.xhtml">${escapeXml(chapter.title)}</a></li>`,
          )
          .join("\n        ")}
      </ol>
    </nav>
  </body>
</html>
`,
  );

  for (const chapter of chapters) {
    zip.file(
      `OEBPS/chapter-${String(chapter.chapterNumber).padStart(3, "0")}.xhtml`,
      buildChapterXhtml(chapter.title, chapter.body),
    );
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    mimeType: "application/epub+zip",
  });

  await writeFile(outputPath, buffer);
}
