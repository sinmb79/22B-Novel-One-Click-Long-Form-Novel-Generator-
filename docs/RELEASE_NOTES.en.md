# 22B Novel Release Notes

## v0.1.0

This is the first public release.  
The goal of this version is to provide a practical end-to-end foundation for long-form novel production workflows.

### Included in this release

| Area | Included |
| --- | --- |
| Engine | Author DNA, plot, chapter generation, memory DB, review, export |
| Provider | `stub`, `OpenAI`, `Anthropic` runtime router |
| Review | Length, protagonist continuity, banned phrase, unresolved foreshadow checks |
| Export | `markdown`, `txt`, `json`, `epub`, `pdf` |
| MCP | `novel.init`, `novel.plot`, `novel.generate`, `novel.memory`, `novel.review`, `novel.export`, `novel.cost`, `novel.status` |
| Dashboard | Project list, chapter previews, exported artifact view |

### User-facing changes

1. You can initialize a project directly from one Author DNA JSON file.
2. Generated chapters automatically update the SQLite memory DB.
3. You can run review checks immediately after generation.
4. You can export the manuscript directly to EPUB and PDF.
5. You can inspect project state through the web dashboard.

### Verification summary

| Item | Result |
| --- | --- |
| Tests | `38 passed` |
| Build | engine / mcp-server / cli / dashboard all passed |
| Smoke test | dist CLI flow `init -> generate -> review -> export` verified |

### Notes

- `node:sqlite` may still print an ExperimentalWarning on Node 24.
- The current reviewer is meant to be a practical first-pass checker, not a literary critic.
- The dashboard is currently focused on reading and inspection.

### Likely next expansions

- Deeper voice and consistency review
- More local model providers
- Editable dashboard workflows
- More platform-specific web novel export formats
