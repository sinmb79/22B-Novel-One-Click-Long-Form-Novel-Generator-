import Link from "next/link";

import { discoverNovelProjects, resolveDashboardRootDirectory } from "../src/lib/dashboard-data";

export default async function DashboardPage() {
  const rootDirectory = resolveDashboardRootDirectory();
  const projects = await discoverNovelProjects(rootDirectory);

  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">22B Novel Dashboard</span>
        <h1>원고의 상태를 한눈에 정리합니다.</h1>
        <p>
          루트 폴더 아래의 초기화된 프로젝트를 읽어서 챕터 수, export 산출물, 마지막 갱신 시각을
          보여줍니다.
        </p>
      </section>

      <section className="grid projects">
        {projects.length === 0 ? (
          <article className="card">
            <h2>프로젝트가 아직 없습니다</h2>
            <p className="muted">
              <code>.novelrc.json</code> 이 있는 프로젝트를 생성하면 여기서 자동으로 잡힙니다.
            </p>
          </article>
        ) : (
          projects.map((project) => (
            <Link key={project.projectDirectory} href={`/projects/${encodeURIComponent(project.name)}`}>
              <article className="card">
                <span className="eyebrow">{project.language.toUpperCase()}</span>
                <h2>{project.name}</h2>
                <p className="muted">{project.projectDirectory}</p>
                <div className="stats">
                  <div className="stat">
                    <strong>{project.chapterCount}</strong>
                    <span>chapters</span>
                  </div>
                  <div className="stat">
                    <strong>{project.exportCount}</strong>
                    <span>exports</span>
                  </div>
                </div>
              </article>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
