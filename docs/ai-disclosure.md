# AI disclosure

Flame in Freefall uses AI in the places listed below. All AI text on the site is labelled, cites its sources and was checked against the NASA PSI data before publishing.

## Where AI is used

| Use | Model | Where | How it is checked |
| --- | --- | --- | --- |
| Investigation summaries | Open model on Groq (name stored in each summary's `model` field) | `web/public/data/summaries.json`, investigation pages | Input is only facts computed from the PSI tables and metadata. Every number must match a fact (whole numbers exactly, decimals within 1 %), every sentence must cite a real investigation or test-row id, and a team member reviews the text. Only `verified: true` summaries are shown. |
| Fire-safety implications | Same model | `web/public/data/implications.json`, Implications page | Facts and evidence ids are computed in code (`ai/src/ffd_ai/facts.py`) and tested. The model only phrases the statement; the same number check and human review apply. |
| Chatbot | Model set by `GROQ_MODEL` | `/api/chat`, chat panel | Answers use only documents retrieved from `search-docs.json`. Citations of documents that were not retrieved are removed. Questions the data does not cover get "Not in the PSI data we loaded." without calling the model. Tested with 15 questions in `ai/tests/chat_questions.json`. |
| Code and documentation | Claude Code (Anthropic) | Data pipeline, models, contract, AI layer, docs | Reviewed by the team and covered by automated tests (`data/tests`, `ai/tests`, `web/lib/**/*.test.ts`). |

No AI-generated images are used. AI content carries no NASA branding.

## Limits

- The models summarize and phrase; they do not compute any number. All numbers come from the PSI tables.
- All results are from microgravity. The PSI data has no partial-gravity tests, so nothing here applies directly to lunar or Martian gravity.
- The chatbot can still phrase things imperfectly. Check its sources before relying on an answer.
- None of this is a safety certification.

## Reproduce

```bash
pip install -e ai
cd ai
python -m ffd_ai.groq                    # list models and test the key
python -m ffd_ai.generate_summaries      # draft summaries, number-checked
python -m ffd_ai.generate_implications   # draft implications, number-checked
python -m ffd_ai.review                  # read drafts and check results
python -m ffd_ai.review approve <ids>    # mark reviewed text as verified, rebuild search docs
python -m ffd_ai.eval_chat               # ask the running chat the 15 test questions
python -m pytest
```
