# Existing Architecture (pre-Stage 1 audit)

Snapshot of the repository at commit `b21cd88` ("Add files via upload", 14 Oct 2026), before the full-stack migration. The original files are preserved unchanged in `legacy/`.

## Stack
Static site: plain HTML, CSS and vanilla JavaScript, published via GitHub Pages. No build step, backend, database, authentication or automated tests.

## Files
| File | Purpose |
|---|---|
| `index.html` | Single-page layout: sidebar, six views, modal, toast |
| `style.css` | Minified green/cream styling, responsive at 1050px and 720px |
| `script.js` | Navigation, three activities, in-memory session history, `.txt` export |
| `README.md` | Description and GitHub Pages instructions |

## Existing functionality
- Six views: Overview, Cognitive tests, Memory activities, My history, Results & reports, Learn & support.
- Three original activities: Word garden (recall 6 words), Focus finder (find 3 targets in 24 symbols), Pattern path (one pattern question).
- Session-only history (lost on refresh) and a plain-text summary export.
- Educational MoCA and MMSE overviews that do not reproduce official test material.
- Extensive "not a diagnosis" disclaimers (retained and extended in the new application).

## Gaps relative to the product brief
No persistence, accounts, charts, adaptive logic, longitudinal analysis, family sharing, multimodal input, API or database. The streak counter and guest profile were cosmetic.

## Preservation approach
- Original files remain in `legacy/` with git history intact (moved with `git mv`).
- The three activities and all educational/disclaimer copy will be carried into the adaptive assessment engine and Learn pages in later stages.
