# 22B Novel

주제 하나로 장편 소설 초안부터 전자책 export까지 이어서 처리하는 TypeScript 기반 소설 제작 워크스페이스입니다.

영문 문서는 [README.en.md](./README.en.md), 변경 이력은 [RELEASE_NOTES.ko.md](./RELEASE_NOTES.ko.md)에서 볼 수 있습니다.

## 1. 한눈에 보기

`주제 입력 -> QuickBook 자동 설계 -> 챕터 생성 -> 메모리/리뷰 -> EPUB/PDF export -> 대시보드 확인`

```mermaid
flowchart LR
  A["Topic + References"] --> B["QuickBook"]
  B --> C["Author DNA"]
  C --> D["Plot Architecture"]
  D --> E["Chapter Generation"]
  E --> F["SQLite Memory + Review"]
  F --> G["EPUB / PDF Export"]
  F --> H["Dashboard"]
  G --> H
```

## 2. 패키지 구성

| 패키지 | 역할 |
| --- | --- |
| `@22b/engine` | Author DNA, plot, generation, quality, export, memory DB |
| `@22b/quickbook` | 주제 기반 자동 전자책 파이프라인 |
| `@22b/cli` | 로컬 배치 실행 CLI |
| `@22b/mcp-server` | MCP 도구 제공 |
| `@22b/dashboard` | 프로젝트와 QuickBook 실행용 웹 UI |

## 3. 설치와 검증

### 요구 사항

| 항목 | 권장값 |
| --- | --- |
| Node.js | 24 이상 |
| 패키지 매니저 | npm |
| 선택 API 키 | `OPENAI_API_KEY` 또는 `ANTHROPIC_API_KEY` |

### 설치

```bash
npm install
```

### 검증

```bash
npm run test -- --run
npm run build
```

## 4. QuickBook 사용법

QuickBook은 보스가 Author DNA JSON을 직접 만들지 않아도, 주제와 참고 자료만으로 장편 초안을 끝까지 생성하는 흐름입니다.

### CLI 예시

```bash
node packages/cli/dist/index.js quickbook ^
  --topic "조선시대 궁녀의 생존기" ^
  --genre "로맨스사극" ^
  --chapters 100 ^
  --style "웹소설체" ^
  --ref "./refs/궁녀-자료.pdf" "https://ko.wikipedia.org/wiki/궁녀" ^
  --format epub pdf
```

### 입력 옵션

| 옵션 | 설명 |
| --- | --- |
| `--topic` | 필수. 작품 주제 |
| `--genre` | 선택. 미지정 시 주제에서 추론 |
| `--chapters` | 총 회차 수 |
| `--style` | 문체 프리셋 |
| `--ref` | 파일 경로, URL, 또는 텍스트 레퍼런스 |
| `--lang` | `ko` 또는 `en` |
| `--format` | `epub`, `pdf` 중 하나 이상 |
| `--output` | 결과 저장 경로 |

### 내부 동작

| 단계 | 설명 |
| --- | --- |
| Reference Processing | PDF, 텍스트, URL 자료를 읽고 요약 |
| Auto DNA | 장르 프리셋과 주제를 바탕으로 Author DNA 생성 |
| Auto Plot | 회차 수에 맞춰 아크와 훅 배치 |
| Batch Generation | 챕터 생성, 메모리 기록, 리뷰 수행 |
| Export | EPUB / PDF 생성 |

## 5. 기존 엔진 흐름 사용법

QuickBook 없이도 Author DNA 기반 수동 흐름을 그대로 쓸 수 있습니다.

```bash
node packages/cli/dist/index.js init C:\\work novels my-author-dna.json
node packages/cli/dist/index.js generate C:\\work\\novels\\my-project 1 3
node packages/cli/dist/index.js review C:\\work\\novels\\my-project 1,2,3
node packages/cli/dist/index.js export C:\\work\\novels\\my-project 1 3 My Novel --format epub
```

## 6. CLI 명령 목록

| 명령 | 설명 |
| --- | --- |
| `help` | 전체 명령 표시 |
| `status` | 현재 워크스페이스 상태 요약 |
| `init` | Author DNA 기반 프로젝트 초기화 |
| `generate` | 챕터 범위 생성 |
| `memory` | 메모리 DB 질의 |
| `review` | 리뷰 실행 |
| `export` | 결과물 export |
| `cost` | 비용 추정 |
| `quickbook` | 주제 기반 전자책 자동 생성 |

## 7. MCP 도구 목록

| 도구 | 설명 |
| --- | --- |
| `novel.init` | 프로젝트 초기화 |
| `novel.plot` | 플롯 생성 |
| `novel.generate` | 챕터 생성 |
| `novel.memory` | 메모리 조회 |
| `novel.review` | 리뷰 실행 |
| `novel.export` | export 생성 |
| `novel.cost` | 비용 추정 |
| `novel.status` | 상태 요약 |
| `novel.quickbook` | 주제 기반 QuickBook 생성 |

## 8. 환경 변수

| 변수 | 설명 |
| --- | --- |
| `NOVEL_PROVIDER` | 기본 provider (`stub`, `openai`, `anthropic`) |
| `NOVEL_MODEL_PLOT` | plot 전용 모델 오버라이드 |
| `NOVEL_MODEL_PROSE` | prose 전용 모델 오버라이드 |
| `NOVEL_MODEL_QA` | qa 전용 모델 오버라이드 |
| `OPENAI_API_KEY` | OpenAI 사용 시 필요 |
| `ANTHROPIC_API_KEY` | Anthropic 사용 시 필요 |
| `NOVEL_PROJECTS_ROOT` | QuickBook 생성 기본 루트 |
| `NOVEL_DASHBOARD_ROOT` | 대시보드가 읽을 프로젝트 루트 |

`stub` provider를 쓰면 API 키 없이도 전체 흐름 테스트가 가능합니다.

## 9. 대시보드

### 실행

```powershell
$env:NOVEL_DASHBOARD_ROOT = "C:\\work\\novels"
npm run dashboard:dev
```

기본 주소:

```text
http://localhost:3000
```

### 화면

| 경로 | 설명 |
| --- | --- |
| `/` | 프로젝트 목록 |
| `/projects/[projectName]` | 프로젝트 상세, 챕터 프리뷰, export 목록 |
| `/quickbook` | 주제 기반 전자책 생성 폼 |

### 미리보기

![대시보드 홈](./assets/dashboard-home.png)
![프로젝트 상세](./assets/dashboard-project.png)

## 10. 현재 상태

| 항목 | 상태 |
| --- | --- |
| 테스트 | `41`개 통과 |
| 빌드 | 전체 통과 |
| Export | `markdown`, `txt`, `json`, `epub`, `pdf` 지원 |
| Provider | `stub`, OpenAI, Anthropic 지원 |
| QuickBook | CLI, MCP, Dashboard 연결 완료 |

## 11. 주의 사항

| 항목 | 설명 |
| --- | --- |
| `node:sqlite` 경고 | Node 24에서 ExperimentalWarning이 보일 수 있으나 동작은 정상 |
| 리뷰 성격 | 현재 리뷰어는 문학 평론보다 규칙 검증에 가까움 |
| Dashboard 경고 | Next/Turbopack에서 파일시스템 추적 관련 경고 1개가 남을 수 있으나 빌드는 통과 |
