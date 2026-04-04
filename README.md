# 22B Novel

주제만 넣으면 장편 소설과 전자책까지 이어서 만드는 22B Labs의 원클릭 소설 워크스페이스입니다.

Create long-form fiction from a single topic and carry it through generation, review, and ebook export in one workspace.

![Node 24+](https://img.shields.io/badge/Node-24%2B-43853D?logo=node.js&logoColor=white)
![Tests 41 Passing](https://img.shields.io/badge/tests-41%20passing-2ea043)
![Build Passing](https://img.shields.io/badge/build-passing-1f6feb)
![MCP 9 Tools](https://img.shields.io/badge/MCP-9%20tools-8b5cf6)
![QuickBook Included](https://img.shields.io/badge/QuickBook-included-b85c38)

## 한국어 우선 안내

처음 보는 분은 아래 한글 문서부터 보시면 바로 실행할 수 있습니다.

If you prefer English, jump to the English links below.

| 문서 | 설명 |
| --- | --- |
| [한글 상세 문서](./docs/README.ko.md) | 설치, QuickBook 사용법, CLI, MCP, 대시보드 안내 |
| [한글 릴리즈 노트](./docs/RELEASE_NOTES.ko.md) | 최근 변경 사항 요약 |
| [English Documentation](./docs/README.en.md) | Setup, QuickBook usage, CLI, MCP, dashboard |
| [Release Notes (English)](./docs/RELEASE_NOTES.en.md) | Recent changes |

## 지금 되는 것

| 기능 | 설명 |
| --- | --- |
| QuickBook | 주제와 레퍼런스로 `EPUB` / `PDF`까지 자동 생성 |
| Engine | Author DNA, plot, chapter generation, review, export |
| MCP | `novel.quickbook` 포함 9개 도구 제공 |
| CLI | `quickbook`, `generate`, `review`, `export` 등 로컬 실행 |
| Dashboard | `/quickbook`와 프로젝트 브라우징 화면 제공 |

## 빠른 시작

```bash
npm install
npm run test -- --run
npm run build
```

QuickBook 예시:

```bash
node packages/cli/dist/index.js quickbook --topic "조선시대 궁녀의 생존기" --genre "로맨스사극" --chapters 100 --format epub
```

## 화면 미리보기

![Dashboard Home](./docs/assets/dashboard-home.png)
![Dashboard Project](./docs/assets/dashboard-project.png)
