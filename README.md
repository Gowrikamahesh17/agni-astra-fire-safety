# agni-astra-fire-safety

**Flame in Freefall** by BrahmAstra Analytics (Gowrika Mahesh, Utkarsh Sawant, Arun Kumar), built for the NASA Space Apps Challenge 2026.

A website that helps spacecraft designers answer one question: *for my mission's atmosphere, which NASA fire experiments apply, what did they show, and where is there no data?* It uses NASA's microgravity combustion tables. Every number links back to the CSV row it came from.

## What the site does

| Page | What it does |
| ---- | ------------ |
| Home | Intro, a scroll story from Earth down to one flame, and the team |
| Guide | Plain-English help: what the site is, how scores work, what the words mean |
| Dashboard | Ranks every investigation for a mission scenario (ISS, lunar habitat, spacesuit, custom and more). You can change the score weights and filter by role |
| Compare | Puts 2 or 3 investigations side by side (hardware, sensors, outcomes) |
| Investigation page | One investigation: summary, objective, every test row with source file and row, filters, grouping and CSV download |
| Evidence gaps | A chart of every test by oxygen and pressure, with your scenario marked, so you can see what is covered and what is empty |
| Implications | AI-written statements for prevention, detection and suppression, each with its evidence |
| Predict | A what-if tool using three simple models. It warns when you go outside the range it was trained on |
| Chat panel | "Ask the data". Answers only from this site's data, cites its sources, and says so when something is not in the data |

The site has a light and dark theme, works with reduced-motion settings, and the chosen scenario is remembered between pages.

## How it works

```
NASA CSV files  ->  data/ (Python)  ->  web/public/data/*.json  ->  web/ (Next.js)
                        ai/ (Python)  ->  summaries, implications, search docs
```

1. `data/` cleans the NASA tables, scores the investigations and trains small baseline models.
2. `ai/` writes summaries and implications with a Groq model. A script checks every number against the facts, and a person approves the text before it appears on the site.
3. Both write JSON into `web/public/data/`. All JSON follows the schemas in `contract/`.
4. The website reads that JSON in the browser. The only server code is the chat route, `web/app/api/chat/route.ts`.

## Folders

| Folder | Purpose |
| ------ | ------- |
| `web/` | Next.js website, including the chat route |
| `data/` | Data pipeline and models (Python), plus the raw NASA CSVs in `data/raw/psi/` |
| `ai/` | Summaries, implications, search docs and chat tests (Python) |
| `contract/` | JSON Schemas shared by all layers, plus valid examples |
| `docs/` | References, data dictionary, model card and AI disclosure |

Main files in `web/`: `app/` (pages), `components/` (screens and visuals), `lib/` (scoring, predictions, data loading, CSV, chat search, with tests next to them), `public/data/` (the JSON the site reads).

## Getting started

### 1. Run the website

Requires Node.js 20.9 or newer.

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

Other commands: `npm run build`, `npm run lint`, `npm test`.

The data files are already committed, so you do not need Python to run the site.

### 2. Turn on the chat (optional)

The chat calls the Groq API from the server.

```bash
cp .env.example web/.env.local
```

Open `web/.env.local` and fill in:

```
GROQ_API_KEY=your_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

`GROQ_MODEL` is optional and defaults to `openai/gpt-oss-120b`. Restart `npm run dev` after changing the file. Without a key the rest of the site still works, and the chat shows that it is unavailable.

The chat limits each visitor to 10 questions per minute, and only the last 6 messages (1000 characters each) are used.

### 3. Rebuild the data (optional)

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

With `make`, from `data/`: `make data`, `make model`, `make examples`, `make test`, `make lint`.

### 4. Regenerate the AI text (optional)

Needs `GROQ_API_KEY` in `.env.local` or `web/.env.local`. The data in step 3 must exist first.

```bash
pip install -e ai
cd ai
python -m ffd_ai.groq                    # list models and test the key
python -m ffd_ai.generate_summaries      # draft summaries, number-checked
python -m ffd_ai.generate_implications   # draft implications, number-checked
python -m ffd_ai.review                  # read the drafts
python -m ffd_ai.review approve all      # approve reviewed text and rebuild search docs
python -m ffd_ai.eval_chat               # ask the running chat the 15 test questions
python -m pytest
```

Drafts are saved as `verified: false`. The site only shows text that has been approved.

### 5. Check the JSON against the contract

```bash
python contract/validate.py
```

## Deploy to Vercel

1. Import the repo at vercel.com/new and set **Root Directory** to `web`.
2. Under Settings → Environment Variables, add `GROQ_API_KEY` (and optionally `GROQ_MODEL`) for Production and Preview. Do not prefix them with `NEXT_PUBLIC_`, or the key would reach the browser.
3. Redeploy. Variables apply only to new deployments.
4. Ask the chat a question on the live site to confirm. A "Chat is not configured" error (503) means the key is missing for that environment.

Never commit a real key. `.env*` files are git-ignored, and only `.env.example` (empty placeholders) is committed. If a key leaks, revoke it in the Groq console and update Vercel.

## Data and models

- **Source:** NASA Physical Sciences Informatics (PSI), CC0-1.0. Tables used: FLEX, CFI-G, BASS, BASS-II and SAME-R (967 test rows). Saffire, SAME, DAFT and other ACME experiments are included as text-only entries. See `docs/references.md`.
- **Models:** three baseline models (FLEX flame extinction, CFI-G self-extinction, FLEX burning rate), trained offline and run in the browser. See `docs/model-card.md`.
- **Ranking score:** a weighted mean of proximity to your scenario (50 %), relevance (30 %) and data usability (20 %). Details are in the model card and the Guide page.
- **Field meanings and units:** `docs/data-dictionary.md`.

## Limits

- All results are **microgravity only**. PSI has no partial-gravity combustion data, so nothing applies directly to lunar or Martian gravity.
- The models are baselines for exploring the data. They are not flight-qualified and not a safety certification.
- AI text is labelled, cites its sources and was number-checked and reviewed, but the chat can still phrase things imperfectly. Check its sources. See `docs/ai-disclosure.md`.

## Docs

- `docs/data-dictionary.md`: every field and unit
- `docs/model-card.md`: models, accuracy, limits and the ranking score
- `docs/references.md`: data sources, citations and tools
- `docs/ai-disclosure.md`: where AI is used and how it is checked

## Ownership

See `.github/CODEOWNERS`. A = `web/`, B = `data/`, `docs/` and the data files in `web/public/data/`, C = `ai/`, the chat route and the AI data files. `contract/` changes go through their own PR.

## License

Code: MIT (see `LICENSE`). Data: CC0-1.0.
