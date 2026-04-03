# 22B Novel 릴리즈 노트

## v0.1.0

첫 공개 버전입니다.  
장편 소설 제작 흐름을 실제로 끝까지 돌릴 수 있는 최소 실용 버전을 목표로 정리했습니다.

### 이번 릴리즈에 포함된 것

| 항목 | 내용 |
| --- | --- |
| Engine | Author DNA, plot, chapter generation, memory DB, review, export |
| Provider | `stub`, `OpenAI`, `Anthropic` runtime router |
| Review | 길이, 주인공 일관성, 금지 표현, 미회수 복선 경고 |
| Export | `markdown`, `txt`, `json`, `epub`, `pdf` |
| MCP | `novel.init`, `novel.plot`, `novel.generate`, `novel.memory`, `novel.review`, `novel.export`, `novel.cost`, `novel.status` |
| Dashboard | 프로젝트 목록, 챕터 프리뷰, export 결과 확인 |

### 사용자 관점에서 달라진 점

1. Author DNA JSON 하나로 프로젝트를 바로 시작할 수 있습니다.
2. 챕터를 생성하면 SQLite memory DB에 요약과 상태가 자동 기록됩니다.
3. 생성 후 바로 리뷰를 돌려 기본 품질 문제를 확인할 수 있습니다.
4. 원고를 EPUB/PDF까지 바로 뽑을 수 있습니다.
5. 대시보드에서 프로젝트 상태를 웹으로 확인할 수 있습니다.

### 검증 결과

| 항목 | 결과 |
| --- | --- |
| 테스트 | `38 passed` |
| 빌드 | engine / mcp-server / cli / dashboard 전체 통과 |
| 스모크 | dist CLI 기준 `init → generate → review → export` 확인 |

### 알고 있어야 할 점

- `node:sqlite`는 Node 24에서 ExperimentalWarning이 출력될 수 있습니다.
- 현재 리뷰어는 문학 비평기보다 "실무용 1차 검사기"에 가깝습니다.
- dashboard는 현재 읽기/확인 중심입니다.

### 다음 확장 후보

- 더 정교한 voice/consistency 리뷰
- local model provider 확장
- dashboard 편집 기능
- 플랫폼별 웹소설 export 포맷 확장
