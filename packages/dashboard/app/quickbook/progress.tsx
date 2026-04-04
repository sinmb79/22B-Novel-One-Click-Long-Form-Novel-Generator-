import type { QuickBookActionState } from "./page";

export function QuickBookProgressPanel(props: {
  state: QuickBookActionState;
  pending: boolean;
}) {
  const { state, pending } = props;
  const latest = state.progress.at(-1);

  return (
    <section className="card quickbook-progress">
      <span className="eyebrow">Pipeline</span>
      <h2>진행 상황</h2>
      <p className="muted">
        {pending
          ? "서버에서 장기 생성 작업을 실행 중입니다. 완료되면 아래에 단계 기록과 결과가 나타납니다."
          : latest?.message ?? "아직 실행 전입니다."}
      </p>

      <div className="progress-timeline">
        {state.progress.length === 0 ? (
          <div className="progress-row">
            <strong>대기 중</strong>
            <span>주제를 입력하고 생성 버튼을 누르면 파이프라인이 시작됩니다.</span>
          </div>
        ) : (
          state.progress.map((entry, index) => (
            <div key={`${entry.stage}-${index}`} className="progress-row">
              <strong>
                {entry.percent >= 100 ? "완료" : index === state.progress.length - 1 ? "진행" : "완료"} ·{" "}
                {entry.stageLabel}
              </strong>
              <span>
                {entry.message}
                {entry.currentChapter && entry.totalChapters
                  ? ` (${entry.currentChapter}/${entry.totalChapters})`
                  : ""}
              </span>
            </div>
          ))
        )}
      </div>

      {state.result ? (
        <div className="result-panel">
          <h3>생성 결과</h3>
          <div className="stats">
            <div className="stat">
              <strong>{state.result.stats.totalChapters}</strong>
              <span>chapters</span>
            </div>
            <div className="stat">
              <strong>{state.result.stats.totalWords}</strong>
              <span>words</span>
            </div>
            <div className="stat">
              <strong>${state.result.stats.totalCost.toFixed(2)}</strong>
              <span>cost</span>
            </div>
          </div>

          <div className="list">
            {state.result.outputFiles.map((file) => (
              <div key={`${file.format}-${file.path}`} className="list-item">
                <h3>{file.format.toUpperCase()}</h3>
                <p>{file.path}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
