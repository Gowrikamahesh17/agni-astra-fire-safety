# agni-astra-fire-safety

Spacecraft fire safety analytics for NASA's microgravity combustion data. Built for the NASA Space Apps Challenge 2026 (Flame in Freefall).

The site ranks NASA experiments by how close their test atmosphere is to a crew habitat (ISS, lunar habitat, spacesuit and others). Every value links back to its source row in the original CSV.

## How it works

Python cleans the NASA tables offline and trains small baseline models. It writes JSON into `web/public/data/`. The Next.js site loads that JSON in the browser, so no Python runs in production.

## Folders

| Folder      | Purpose                                                     |
| ----------- | ----------------------------------------------------------- |
| `web/`      | Next.js app                                                 |
| `data/`     | Data pipeline and models (Python), plus the raw NASA CSVs   |
| `ai/`       | Summaries, implications and chat retrieval (not built yet)  |
| `contract/` | JSON Schemas shared by all layers, plus valid examples      |
| `docs/`     | References, data dictionary and model card                  |

## Status

| Part | State |
| ---- | ----- |
| Data pipeline, models, contract | Done |
| Dashboard, investigation pages, evidence gaps, implications, CSV export | Done |
| Chat panel | UI is done. `/api/chat` is a stub that returns "stub" |
| Compare and Predict pages | "Coming soon" |
| `ai/` folder | Empty |

The site works without the AI files (`summaries.json`, `implications.json`, `search-docs.json`).

## Getting started

### Web app

Requires Node.js 20 or newer.

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

Other commands: `npm run build`, `npm run lint`, `npm test`.

### Data pipeline

Requires Python 3.11 or newer (3.12 recommended).

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS / Linux

pip install -r requirements-dev.txt
pip install -e data
cd data
python -m ffd_data              # clean data, train models, write web/public/data and contract/examples
python -m pytest
```

With `make`: `make data`, `make model`, `make examples`, `make test`, `make lint`.

### Check the JSON against the contract

```bash
python contract/validate.py
```

### Environment variables

```bash
cp .env.example .env.local
```

Set `GROQ_API_KEY` and `GROQ_MODEL` for the chat. Next.js reads env files from its own folder, so also copy the file to `web/.env.local`. All `.env*` files except `.env.example` are git-ignored.

## Data

All data comes from NASA's Physical Sciences Informatics (PSI) repository (CC0-1.0): FLEX, CFI-G, BASS, BASS-II and SAME-R. Raw files are in `data/raw/psi/`, unchanged. See `docs/references.md` for citations.

## More docs

- `docs/data-dictionary.md`: every field and unit
- `docs/model-card.md`: models, accuracy, limits and the ranking score
- `docs/references.md`: sources and tools

The models are baselines for exploring the data, not flight-qualified tools. The data has no partial-gravity results, so all findings are microgravity only.

## Ownership

See `.github/CODEOWNERS`. A = `web/`, B = `data/`, `docs/` and the data files in `web/public/data/`, C = `ai/`, the chat route and the AI data files. `contract/` changes go through their own PR.

## License

Code: MIT (see `LICENSE`). Data: CC0-1.0.
