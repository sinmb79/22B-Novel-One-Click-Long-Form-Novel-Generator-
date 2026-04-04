"use client";

import { useActionState, useMemo, useState } from "react";

import { QuickBookProgressPanel } from "./progress";

import type { QuickBookActionState } from "./page";

function estimateCost(chapters: number): number {
  return Number((0.084 * chapters + 0.12).toFixed(2));
}

function estimateTimeHours(chapters: number): number {
  return Number(((chapters * 70) / 3600).toFixed(1));
}

export function QuickBookForm(props: {
  initialState: QuickBookActionState;
  action: (state: QuickBookActionState, formData: FormData) => Promise<QuickBookActionState>;
}) {
  const [state, formAction, pending] = useActionState(props.action, props.initialState);
  const [chapters, setChapters] = useState(100);
  const estimate = useMemo(
    () => ({
      cost: estimateCost(chapters),
      hours: estimateTimeHours(chapters),
    }),
    [chapters],
  );

  return (
    <section className="quickbook-grid">
      <form action={formAction} className="card quickbook-form">
        <div className="form-cluster">
          <label className="field">
            <span>주제</span>
            <input
              name="topic"
              type="text"
              placeholder="예: 조선시대 궁녀의 생존기"
              required
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>장르</span>
              <select name="genre" defaultValue="로맨스사극">
                <option value="로맨스사극">로맨스사극</option>
                <option value="판타지">판타지</option>
                <option value="SF">SF</option>
                <option value="스릴러">스릴러</option>
                <option value="회귀물">회귀물</option>
                <option value="">자동 추론</option>
              </select>
            </label>

            <label className="field">
              <span>분량</span>
              <select
                name="chapters"
                defaultValue="100"
                onChange={(event) => setChapters(Number(event.target.value))}
              >
                <option value="50">50화</option>
                <option value="100">100화</option>
                <option value="150">150화</option>
                <option value="200">200화</option>
              </select>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>문체</span>
              <select name="style" defaultValue="웹소설체">
                <option value="웹소설체">웹소설체</option>
                <option value="문학체">문학체</option>
                <option value="라이트노벨체">라이트노벨체</option>
                <option value="하드보일드">하드보일드</option>
              </select>
            </label>

            <label className="field">
              <span>언어</span>
              <select name="language" defaultValue="ko">
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>

          <fieldset className="fieldset">
            <legend>출력 포맷</legend>
            <label className="checkbox">
              <input type="checkbox" name="format" value="epub" defaultChecked />
              <span>EPUB</span>
            </label>
            <label className="checkbox">
              <input type="checkbox" name="format" value="pdf" />
              <span>PDF</span>
            </label>
          </fieldset>

          <label className="field">
            <span>레퍼런스</span>
            <textarea
              name="references"
              rows={6}
              placeholder={"한 줄에 하나씩 입력하세요.\n파일 경로, URL, 또는 짧은 메모 텍스트 모두 가능합니다."}
            />
          </label>
        </div>

        <aside className="estimate-panel">
          <p className="estimate-kicker">예상치</p>
          <strong>${estimate.cost.toFixed(2)}</strong>
          <span>약 {estimate.hours}시간</span>
          <p>
            100화 기준으로 plot, prose, review, export까지 한 번에 진행합니다.
          </p>
        </aside>

        <button className="submit-button" type="submit" disabled={pending}>
          {pending ? "전자책 생성 중..." : "전자책 생성 시작"}
        </button>

        {state.error ? <p className="error-text">{state.error}</p> : null}
      </form>

      <QuickBookProgressPanel state={state} pending={pending} />
    </section>
  );
}
