# agni-astra-fire-safety

Spacecraft fire safety analytics engine combining semantic search and flammability modeling over NASA's microgravity combustion archives.

## Repository layout

| Folder      | Purpose                                                        |
| ----------- | -------------------------------------------------------------- |
| `web/`      | Next.js app (deployed to Vercel)                               |
| `data/`     | Offline data pipeline and flammability models (Python)         |
| `ai/`       | Summaries, implications and chatbot retrieval docs (Python)    |
| `contract/` | JSON Schemas shared by all three layers, plus valid examples   |
| `docs/`     | References, data dictionary, model card, AI disclosure, demo   |

Python prepares all data offline and writes JSON into `web/public/data/`. The deployed site is static JSON plus one chat route.

## Getting started

### Python (data/ and ai/)

Requires Python 3.11+ (3.12 recommended, see `.python-version`).

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements-dev.txt
```

Use `requirements.txt` instead if you only need to run the pipeline, not test or lint it.

### Environment variables

```bash
cp .env.example .env.local
```

Fill in `GROQ_API_KEY` and `GROQ_MODEL`. Next.js reads env files from its own folder, so also copy the file to `web/.env.local`. All `.env*` files except `.env.example` are git-ignored.

## License

Code: MIT (see `LICENSE`). Data: CC0-1.0.
