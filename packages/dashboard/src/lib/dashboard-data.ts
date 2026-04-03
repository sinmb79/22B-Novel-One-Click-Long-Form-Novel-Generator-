import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

interface NovelConfig {
  projectName: string;
  chapterWordCount: number;
  language: string;
}

export interface DashboardProjectSummary {
  name: string;
  projectDirectory: string;
  chapterCount: number;
  exportCount: number;
  language: string;
}

export interface DashboardProjectDetail {
  name: string;
  projectDirectory: string;
  language: string;
  chapters: Array<{
    chapterNumber: number;
    filename: string;
    title: string;
    preview: string;
  }>;
  exports: string[];
}

async function readJson<T>(path: string): Promise<T> {
  const text = await readFile(path, "utf8");
  return JSON.parse(text.replace(/^\uFEFF+/, "")) as T;
}

async function isNovelProject(projectDirectory: string): Promise<boolean> {
  try {
    const info = await stat(join(projectDirectory, ".novelrc.json"));
    return info.isFile();
  } catch {
    return false;
  }
}

function buildPreview(markdown: string): string {
  return markdown
    .replace(/^#\s+Chapter\s+\d+\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function compareNumerically(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function resolveDashboardRootDirectory(): string {
  if (process.env.NOVEL_DASHBOARD_ROOT) {
    return resolve(process.env.NOVEL_DASHBOARD_ROOT);
  }

  return resolve(process.cwd(), "..", "..");
}

export async function discoverNovelProjects(
  rootDirectory: string,
): Promise<DashboardProjectSummary[]> {
  const entries = await readdir(rootDirectory, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => join(rootDirectory, entry.name));
  const summaries: DashboardProjectSummary[] = [];

  for (const projectDirectory of directories) {
    if (!(await isNovelProject(projectDirectory))) {
      continue;
    }

    const config = await readJson<NovelConfig>(join(projectDirectory, ".novelrc.json"));
    const chapterFiles = await readdir(join(projectDirectory, "output", "chapters")).catch(() => []);
    const exportFiles = await readdir(join(projectDirectory, "output", "exports")).catch(() => []);

    summaries.push({
      name: config.projectName,
      projectDirectory,
      chapterCount: chapterFiles.filter((entry) => entry.endsWith(".md")).length,
      exportCount: exportFiles.length,
      language: config.language,
    });
  }

  return summaries.sort((left, right) => compareNumerically(left.name, right.name));
}

export async function readNovelProjectDetail(
  projectDirectory: string,
): Promise<DashboardProjectDetail> {
  const config = await readJson<NovelConfig>(join(projectDirectory, ".novelrc.json"));
  const chapterDirectory = join(projectDirectory, "output", "chapters");
  const exportDirectory = join(projectDirectory, "output", "exports");
  const chapterFiles = (await readdir(chapterDirectory)).filter((entry) => entry.endsWith(".md"));
  const exports = await readdir(exportDirectory).catch(() => []);

  const chapters = await Promise.all(
    chapterFiles.sort(compareNumerically).map(async (filename) => {
      const markdown = await readFile(join(chapterDirectory, filename), "utf8");
      const chapterNumber = Number(filename.replace(".md", ""));

      return {
        chapterNumber,
        filename,
        title: `Chapter ${chapterNumber}`,
        preview: buildPreview(markdown),
      };
    }),
  );

  return {
    name: config.projectName,
    projectDirectory,
    language: config.language,
    chapters,
    exports: exports.sort(compareNumerically),
  };
}
