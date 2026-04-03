import Link from "next/link";
import { notFound } from "next/navigation";

import {
  readNovelProjectDetail,
  resolveDashboardRootDirectory,
} from "../../../src/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectName: string }>;
}) {
  const { projectName } = await params;
  const rootDirectory = resolveDashboardRootDirectory();
  const detail = await readNovelProjectDetail(`${rootDirectory}\\${projectName}`).catch(() => null);

  if (!detail) {
    notFound();
  }

  return (
    <main className="shell">
      <Link className="back-link" href="/">
        ← 프로젝트 목록
      </Link>
      <section className="hero">
        <span className="eyebrow">{detail.language.toUpperCase()}</span>
        <h1>{detail.name}</h1>
        <p>{detail.displayPath}</p>
      </section>

      <section className="row">
        <article className="card">
          <h2>Chapters</h2>
          <div className="list">
            {detail.chapters.map((chapter) => (
              <div key={chapter.filename} className="list-item">
                <h3>{chapter.title}</h3>
                <p>{chapter.preview}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="grid">
          <article className="card">
            <h2>Project Stats</h2>
            <div className="stats">
              <div className="stat">
                <strong>{detail.chapters.length}</strong>
                <span>chapters</span>
              </div>
              <div className="stat">
                <strong>{detail.exports.length}</strong>
                <span>exports</span>
              </div>
            </div>
          </article>

          <article className="card">
            <h2>Exports</h2>
            <div className="list">
              {detail.exports.length === 0 ? (
                <div className="list-item">
                  <p>아직 export 산출물이 없습니다.</p>
                </div>
              ) : (
                detail.exports.map((filename) => (
                  <div key={filename} className="list-item">
                    <strong>{filename}</strong>
                  </div>
                ))
              )}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
