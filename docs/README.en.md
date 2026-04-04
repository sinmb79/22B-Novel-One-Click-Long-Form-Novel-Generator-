# 22B Novel

22B Novel is a TypeScript workspace for taking a story from topic to long-form draft, review, and ebook export.

For the Korean-first guide, see [README.ko.md](./README.ko.md). For recent changes, see [RELEASE_NOTES.en.md](./RELEASE_NOTES.en.md).

## 1. At a Glance

`Topic input -> QuickBook auto design -> chapter generation -> memory and review -> EPUB/PDF export -> dashboard`

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

## 2. Package Layout

| Package | Role |
| --- | --- |
| `@22b/engine` | Author DNA, plot, generation, quality, export, memory DB |
| `@22b/quickbook` | Topic-driven automatic ebook pipeline |
| `@22b/cli` | Local batch CLI |
| `@22b/mcp-server` | MCP tool surface |
| `@22b/dashboard` | Web UI for project browsing and QuickBook |

## 3. Install and Verify

### Requirements

| Item | Recommended |
| --- | --- |
| Node.js | 24+ |
| Package manager | npm |
| Optional API keys | `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` |

### Install

```bash
npm install
```

### Verify

```bash
npm run test -- --run
npm run build
```

## 4. QuickBook Usage

QuickBook is the one-click path: give it a topic and optional references, and it generates a long-form draft through export.

### CLI example

```bash
node packages/cli/dist/index.js quickbook \
  --topic "A palace maid surviving in Joseon" \
  --genre "로맨스사극" \
  --chapters 100 \
  --style "웹소설체" \
  --ref "./refs/maid-notes.pdf" "https://ko.wikipedia.org/wiki/궁녀" \
  --format epub pdf
```

### Input options

| Option | Description |
| --- | --- |
| `--topic` | Required story topic |
| `--genre` | Optional genre override |
| `--chapters` | Total chapter count |
| `--style` | Style preset |
| `--ref` | File path, URL, or plain text reference |
| `--lang` | `ko` or `en` |
| `--format` | One or more of `epub`, `pdf` |
| `--output` | Output path |

### Internal stages

| Stage | Description |
| --- | --- |
| Reference Processing | Reads PDF, text, and URL sources and summarizes them |
| Auto DNA | Builds Author DNA from topic and genre presets |
| Auto Plot | Plans arcs and hook intervals |
| Batch Generation | Generates chapters, writes memory, runs review |
| Export | Produces EPUB / PDF |

## 5. Core Engine Flow

You can still use the workspace without QuickBook by providing an explicit Author DNA JSON.

```bash
node packages/cli/dist/index.js init C:\\work novels my-author-dna.json
node packages/cli/dist/index.js generate C:\\work\\novels\\my-project 1 3
node packages/cli/dist/index.js review C:\\work\\novels\\my-project 1,2,3
node packages/cli/dist/index.js export C:\\work\\novels\\my-project 1 3 My Novel --format epub
```

## 6. CLI Commands

| Command | Description |
| --- | --- |
| `help` | Show all commands |
| `status` | Print workspace status |
| `init` | Initialize a project from Author DNA |
| `generate` | Generate a chapter range |
| `memory` | Query project memory |
| `review` | Run review |
| `export` | Export generated output |
| `cost` | Estimate generation cost |
| `quickbook` | Run the automatic ebook pipeline |

## 7. MCP Tools

| Tool | Description |
| --- | --- |
| `novel.init` | Initialize a project |
| `novel.plot` | Build plot |
| `novel.generate` | Generate chapters |
| `novel.memory` | Query memory |
| `novel.review` | Run review |
| `novel.export` | Export artifacts |
| `novel.cost` | Estimate cost |
| `novel.status` | Show status |
| `novel.quickbook` | Run QuickBook from topic and references |

## 8. Environment Variables

| Variable | Description |
| --- | --- |
| `NOVEL_PROVIDER` | Default provider: `stub`, `openai`, `anthropic` |
| `NOVEL_MODEL_PLOT` | Plot model override |
| `NOVEL_MODEL_PROSE` | Prose model override |
| `NOVEL_MODEL_QA` | QA model override |
| `OPENAI_API_KEY` | Required for OpenAI |
| `ANTHROPIC_API_KEY` | Required for Anthropic |
| `NOVEL_PROJECTS_ROOT` | Default root for QuickBook-created projects |
| `NOVEL_DASHBOARD_ROOT` | Root scanned by the dashboard |

The `stub` provider lets you test the full flow without live model keys.

## 9. Dashboard

### Run

```powershell
$env:NOVEL_DASHBOARD_ROOT = "C:\\work\\novels"
npm run dashboard:dev
```

Default address:

```text
http://localhost:3000
```

### Routes

| Route | Description |
| --- | --- |
| `/` | Project list |
| `/projects/[projectName]` | Project detail with chapter previews and exports |
| `/quickbook` | Topic-driven QuickBook form |

### Preview

![Dashboard Home](./assets/dashboard-home.png)
![Project Detail](./assets/dashboard-project.png)

## 10. Current Status

| Item | Status |
| --- | --- |
| Tests | `41` passing |
| Build | Full workspace build passes |
| Export | `markdown`, `txt`, `json`, `epub`, `pdf` |
| Providers | `stub`, OpenAI, Anthropic |
| QuickBook | Wired into CLI, MCP, and Dashboard |

## 11. Notes

| Item | Description |
| --- | --- |
| `node:sqlite` warning | Node 24 may still print an ExperimentalWarning, but runtime behavior is fine |
| Reviewer scope | The current reviewer is rule-based, not a literary judge |
| Dashboard warning | Next/Turbopack may still print one filesystem tracing warning while build remains successful |
