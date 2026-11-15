# Submission Pack: BrahmAstra Analytics · Flame in Freefall

NASA Space Apps Challenge 2026 · challenge: *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*

**Deadline: Sunday 15 Nov 2026, 11:59 p.m. in the time zone of our Local Event** (confirm the exact cutoff with the Local Lead). Internal target: submit by 18:00. Only the last saved submission is judged, and we can resubmit until the deadline.

---

## 0. Status of this file

Refilled from the code on 2026-11-15 (after the Moon-window fix). Every number below was read from the repo (`web/public/data/`, `ai/config.yaml`, `web/package.json`, the Python `pyproject.toml` files) or computed from `observations.json`. Items only the team can answer are marked `HUMAN:`. Find them with `grep -n "HUMAN" docs/demo/SUBMISSION.md`.

Open HUMAN items:

1. Demo link (slides or video).
2. Screenshots: `docs/demo/screenshots/` exists but is empty. Add 6 to 8 clean shots.
3. Team-page banner (reported by the team; not in the repo).
4. The PSI-47 id and the two paper titles (reported by the team; not in the repo, so not checked here). `docs/references.md` already lists the two exploration-atmosphere papers and marks the Saffire and SAME ids "to verify".
5. SI form tick "Other Project-Related SI Use" (section 3.6).
6. The NASA presentation reference (section 3.7).
7. Team photos on `/team` (see section 6): confirm every person pictured is an adult who agreed, and who made the photos.
8. Decide the 17-versus-20 wording (section 3.5, "Factors we considered").
9. Tick the verification boxes and submit.

Marker meanings: `HUMAN:` = only the team knows · `[ ]` = a task to tick.

---

## 1. Hard rules (from the official guides, do not break)

- **Demo:** slides of **7 or fewer, including the title slide**, or a video of **30 seconds or less**. Over either limit makes us ineligible for Global Judging.
- **Hosting:** the demo and the project must be on an external public link (YouTube, Google Drive, GitHub, OneDrive, Dropbox and so on) with **no password, permission or registration**. Files cannot be uploaded to the Space Apps site. Links must be full URLs starting with `https://`.
- **Language:** everything in English. A spoken video may use another language only with English subtitles.
- **NASA data:** at least one NASA dataset must be used, or we are not eligible for a Global Award.
- **Every resource listed:** all code, text and images we used, even open source or free, go in the form's link lists (sections 3.7 and 3.8). Nothing copyrighted without permission.
- **SI (AI) labelling:** AI-generated images and video carry a **visible watermark**. AI-generated audio, code and data are acknowledged in descriptive text and metadata. AI-generated content must not use or modify NASA logos, flags or mission identifiers.
- **Idea:** AI should not be used to come up with our idea for solving the challenge. Using it inside the product is allowed and disclosed.
- **People:** no image, video, audio or other likeness of anyone under 18 in the demo or project.
- **Team:** all members registered for the same Local Event and listed on the team page's Members tab.
- **Saving is public:** "Save Progress" makes the content visible to anyone who visits the team page. It does **not** submit. Only **Submit for Judging** does. Nothing private (keys, emails) belongs in the form.

---

## 2. Facts sheet (single source of truth)

All numbers in this file come from here.

| Item | Value | Source |
| --- | --- | --- |
| Project name | **Flame in Freefall** (site title and README). HUMAN: confirm. The team page has used both "BrahmAstra" and "BrahmAshtra". The code uses **BrahmAstra Analytics** everywhere, so use that spelling | `web/app/layout.tsx`, `docs/ai-disclosure.md` |
| Tagline (10 words) | Fire safety for crew habitats, from NASA's microgravity data | Home page heading, `web/app/page.tsx` |
| Team members | Gowrika Mahesh, Utkarsh Sawant, Arun Kumar. HUMAN: match the team page's Members tab | Site footer, `web/lib/team.ts` |
| Live URL | https://agni-astra-fire-safety-web.vercel.app/ . HUMAN: open it in a private window and confirm it needs no login | Team |
| Repo URL | https://github.com/Gowrikamahesh17/agni-astra-fire-safety (public, confirmed by the team) | `git remote get-url origin` |
| Demo URL | HUMAN: public link to the slides or video | |
| NASA tables | 6 CSV files from 5 investigations (CFI-G has a normal-flame and an inverse-flame file) | `data/raw/psi/` |
| Investigations on the site | 15: 5 with test tables and 10 text-only (Saffire-I, II, III, SAME, DAFT and 5 ACME experiments) | `web/public/data/investigations.json` |
| Test records | **967** (CFI-G 333, FLEX 274, BASS-II 129, BASS 122, SAME-R 109) | `web/public/data/observations.json` |
| Moon-habitat window | **20 of 967** tests have Moon-range chamber air (oxygen 30 % or more at 0.7033 bar / 10.2 psi or less). All 20 are CFI-G normal flames. 28 CFI-G inverse-flame tests also fall in the numeric range but are excluded: their oxygen value describes the burner stream, not the chamber. FLEX, BASS-II, BASS and SAME-R have none | Computed from `observations.json`; `ai/src/ffd_ai/facts.py` |
| FLEX near the lunar atmosphere | 17 FLEX droplet tests within one distance step of 30 % O2 and 0.703 bar. 15 were disrupted and 2 burned to completion. None went out (extinguished). These are a different count from the 20 above | `observations.json`, `distance.lunar_habitat <= 1` |
| Pages | `/` home, `/guide`, `/dashboard`, `/compare`, `/investigations/[id]`, `/gaps`, `/implications`, `/predict`, `/team`, plus the chat panel (API route `/api/chat`) | `web/app/` |
| Score formula (version 2.0) | Site score = weighted mean of three 0-100 parts, default weights 50 % proximity, 30 % relevance, 20 % usability. Proximity = 100 × (1 − closest distance ÷ 3), where distance counts 5 points of oxygen or 0.10 bar as one unit. Relevance is fixed by role (solid-material prevention 100, suppression 90, detection 90, gas-flame behaviour 70). Usability adds 40 for a recorded outcome, 30 for oxygen and pressure, 20 for 100 or more rows and 10 for source rows | `data/src/ffd_data/scoring.py`, `docs/model-card.md` |
| Known limitation | Distance and proximity scores treat CFI-G inverse-flame oxygen as the burner-stream value. The Moon-window count excludes those tests. Stated in the model card and in a footnote on the Evidence gaps chart | `docs/model-card.md`, `web/components/GapsView.tsx` |
| Main model | `flex_extinction`: logistic regression, will a FLEX droplet flame go out? 261 rows, 5-fold cross-validation, balanced accuracy **0.787** (baseline 0.500), ROC AUC **0.870**. Valid range: O2 12-34 %, 0.70-3.09 bar, CO2 0-70 %, He 0-45 %, droplet 1.1-4.67 mm | `web/public/data/models/flex_extinction.json` |
| Other models | `cfig_self_extinction` (logistic, 272 rows, balanced accuracy 0.679, AUC 0.734); `flex_burning_rate` (ridge, 257 rows, R² 0.713, mean error 0.047 mm²/s against 0.107 for the mean) | `web/public/data/models/` |
| AI model | `openai/gpt-oss-120b` on Groq (an OpenAI open-weight model, not from a Chinese lab) | `ai/config.yaml`, `web/lib/chat/index.ts` |
| AI summaries | 15 written, 15 verified. The PSI-159 summary was edited by hand by the team after drafting | `web/public/data/summaries.json` |
| AI implications | 8 written, 8 verified | `web/public/data/implications.json` |
| Chat search index | 1005 documents (15 investigations, 15 summaries, 8 implications, 967 test rows) | `web/public/data/search-docs.json` |
| Screenshots | HUMAN: folder `docs/demo/screenshots/` exists but is empty | |

Facts from the challenge and PSI pages (re-check before submitting):

- PSI combustion science lists 24 investigations; all but one show licence CC0-1.0.
- The challenge page says PSI holds no partial-gravity combustion data today (LUCI and FM2 are planned).
- Moon-habitat air is expected to be **30 % oxygen or more at 10.2 psi or less**, against about 21 % at 14.7 psi on Earth.

---

## 3. The project form (live form fields, in order)

Where: team page, **Project** tab, **Edit**. Fields marked * are required.

### 3.1 Project Name

- **Form text:** "Give your project a title that helps describe what your team worked on."
- **Limit:** none shown. Keep it under 70 characters.
- **Draft:** `Flame in Freefall: Fire safety for crew habitats, from NASA's microgravity data`
- **Check:** characters = 79. Over the 70 suggested, so shorten to `Flame in Freefall` (17) if the form allows only a short title.

### 3.2 Summary *

- **Form text:** "What did you develop? How does it address the challenge? Why is it important?"
- **Limits:** suggested 50 to 200 words; the form's counter stops at **1500 characters**.
- **Draft:**

> Flame in Freefall is a web dashboard that turns NASA's microgravity combustion experiments into ranked, searchable fire-safety insight for Moon and Mars habitats. We cleaned 6 experimental tables from 5 investigations in NASA's Physical Sciences Informatics (PSI) repository into 967 individual test records, and added 10 text-only entries for related experiments. Users rank investigations with adjustable weights for atmosphere proximity, habitat relevance and data usability, search and group the tests, and click any finding to see the exact source row. AI-written summaries and a chatbot are checked against the data, and the chatbot answers "Not in the PSI data we loaded." instead of guessing. Only 20 of 967 tests have Moon-range chamber air, and PSI has no partial-gravity data, so the site shows that gap openly. It helps researchers and engineers decide which experiments matter before habitats are built.

- **Check:** words = 139 (50 to 200), characters = 916 (1500 or fewer)

### 3.3 Project Links: Project Demonstration *

- **Form text:** a slide presentation (7 slides or fewer, including title and introduction) or a video (30 seconds or less), on a public host, link needing no password, permission or registration.
- **Value:** HUMAN: demo URL (full URL with `https://`)
- **Check:** opens in a private window; slides <= 7 or video <= 30 s. Build it from section 4.

### 3.4 Project Links: Project *

- **Form text:** a public link to the final project (website, hosting service or code repository). No password, permission or registration.
- **Value:** https://agni-astra-fire-safety-web.vercel.app/ . The repo, https://github.com/Gowrikamahesh17/agni-astra-fire-safety, goes in the details text and the link lists.
- **Check:** every page loads in a private window. The site works with the chatbot switched off: if `GROQ_API_KEY` is missing, only the chat shows that it is unavailable.

### 3.5 Project Information: Project Details *

- **Form text:** what it does and how it works, benefits, intended impact, tools, languages, hardware and software, how it is creative, factors the team considered.
- **Editor:** a rich-text box (bold, italics, underline, links). No limit is shown; aim for **about 400 to 700 words**. Use short bold lead-ins instead of long headings.
- **Draft:**

> **What it does.** Flame in Freefall ranks and explains NASA combustion experiments for crew-habitat fire safety. Pick a mission scenario (ISS cabin, lunar habitat, exploration atmosphere, pressurized rover, Mars transit vehicle, spacesuit or your own oxygen and pressure) and every page compares the experiments to it. The pages are: a Dashboard that ranks investigations; Compare, which sets two or three side by side; an investigation page listing every test with its source file and row and a CSV download; Evidence gaps, a chart of every test by oxygen and pressure; Implications for prevention, detection and suppression; Predict, a what-if tool; a Guide for newcomers; and a chat panel that answers questions from the data.
>
> **How it works.** Python pipelines clean the PSI experimental tables offline into JSON files that follow shared JSON Schemas. The Next.js site loads those files in the browser, so no Python runs in production. The only server code is the chat route. Every observation keeps its source file and row. Ranking is a weighted average of three parts: how close the nearest test came to your atmosphere (proximity), how directly the study bears on crew fire safety (relevance), and how usable its data is. The default weights are 50 %, 30 % and 20 %, and you can change them.
>
> **Data.** 967 test records from 6 CSV tables in 5 PSI investigations (FLEX, CFI-G, BASS, BASS-II, SAME-R), all CC0-1.0 and cited by DOI. Ten more investigations (Saffire I to III, SAME, DAFT and five ACME experiments) appear as text-only entries with links to their NASA sources.
>
> **Prediction.** Three simple baseline models are trained offline with scikit-learn and run in the browser. The main one predicts whether a FLEX droplet flame will go out: 261 tests, 5-fold cross-validation, balanced accuracy 0.787 against 0.500 for always guessing the majority, and ROC AUC 0.870. The other two cover CFI-G gas-flame self-extinction and the FLEX burning rate. Each is only valid inside its tested range, and the Predict page greys out the number and warns when an input falls outside it.
>
> **AI.** All 15 investigation summaries and all 8 implication statements were drafted by openai/gpt-oss-120b on Groq from facts computed in code. A script rejects any draft whose numbers are not in those facts, and a person reviewed each one. The PSI-159 summary was then edited by hand. Only approved text is shown. The chatbot answers only from documents retrieved from our own search index, cites them, and replies "Not in the PSI data we loaded." when the data does not cover the question. AI-generated content is labelled on the site.
>
> **Tools.** Next.js 16, React 19, TypeScript, Chart.js and MiniSearch for the site; Python 3.12 with pandas, NumPy, scikit-learn, jsonschema, httpx, PyYAML and python-dotenv for the data and AI layers; Vitest and pytest for tests; Groq for the model; hosted on Vercel. Code: https://github.com/Gowrikamahesh17/agni-astra-fire-safety
>
> **Creativity.** Every finding links back to its exact source row. The chatbot is built to say "not in the data" rather than guess. A scroll story takes the visitor from Earth to one fuel droplet, and the Predict page shows its answer as a flame that shrinks as the chance of going out rises.
>
> **Factors we considered.** No partial-gravity data exists in PSI, so Moon and Mars gravity are not modelled and the site says so. Only 20 of 967 tests have Moon-range chamber air, and all are gas flames (CFI-G normal flames). 28 CFI-G inverse-flame tests are excluded from that count because their oxygen value describes the burner stream, not the chamber. The FLEX tests nearest that atmosphere (17) ended in disruption or burning to completion, not extinction. Flames still burning when a CFI-G test was stopped are marked as censored, so they may have burned longer. Distance scores still use the burner-stream value for inverse flames, a limitation noted in the model card and on the chart. The models are baselines and not flight-qualified.
>
> **Impact.** Helps researchers and engineers find the experiments that matter for habitat fire safety. The site also notes general Earth applications (extinguishers, smoke detection, protective gear), clearly labelled as context rather than measured results.
>
> **Links.** Live site: https://agni-astra-fire-safety-web.vercel.app/ · Code: https://github.com/Gowrikamahesh17/agni-astra-fire-safety · Demo: HUMAN

- **Check:** words = 694 (target 400 to 700); every claim matches section 2. Recount after filling the demo link.
- **HUMAN (17 versus 20):** the draft keeps both numbers and says why they differ. Cut the FLEX 17 sentence if it confuses readers.

### 3.6 Use of Super Intelligence (SI) *

- **Form text:** a multi-select. "Select all that apply." The answer is for data collection and is **not seen by judges**, but judges do see watermarks, descriptive text and metadata in the project itself.
- **Options on the form:** Ideation or Brainstorming · Research or Information Gathering · Data Analysis and Interpretation · Building SI/ML Into the Project · Coding, Debugging, or Troubleshooting · Writing, Editing, or Translation · Visual Design or Image Creation · Presentation, Video, or Audio · Other Project-Related SI Use · None / Did not use SI or SI tools.
- **Our answers.** Team-confirmed rows are marked:

| Option | Tick? | Evidence |
| --- | --- | --- |
| Ideation or Brainstorming | Yes (team confirmed) | Humans and AI planned the architecture and work split together. The solution idea itself comes from the challenge text, not from AI |
| Research or Information Gathering | Yes (team confirmed) | The team read the NASA sources (see `docs/references.md`) and used AI to assist |
| Data Analysis and Interpretation | Yes | `docs/ai-disclosure.md`: Claude Code helped build the data pipeline and models |
| Building SI/ML Into the Project | Yes | Groq `openai/gpt-oss-120b` for summaries, implications and chat; scikit-learn baseline models |
| Coding, Debugging, or Troubleshooting | Yes | `docs/ai-disclosure.md`: Claude Code wrote or helped write the `web/` app, data pipeline, AI layer and docs |
| Writing, Editing, or Translation | Yes | AI drafted the summaries and implications, and Claude Code helped write the interface text and docs |
| Visual Design or Image Creation | Yes | The home-page astronaut illustration was generated with Google Gemini, background removed with remove.bg, and carries a visible "AI-generated image" label |
| Presentation, Video, or Audio | Yes (team confirmed) | AI will help make the slides or video. If the final demo contains AI-generated images, video or audio, add a visible watermark or label |
| Other Project-Related SI Use | HUMAN | Tick only if AI was used in a way none of the other options cover |
| None / Did not use SI or SI tools | No | Do not combine with the others |

The site already carries the disclosure: the footer says "AI-generated content is labelled", the home-page image is labelled, and `docs/ai-disclosure.md` lists every use, including prompt versions (`summary-v2` for PSI-159 only, `summary-v1` for the other 14). The footer does not yet name the model. Suggested wording if the team wants it there: *"Summaries and chat answers on this site are AI-generated by openai/gpt-oss-120b via Groq and checked against NASA PSI data. Parts of the code and documentation were written with Claude Code. The home-page illustration was generated with Gemini and is labelled."*

### 3.7 NASA Data * (Link Text + Link URL pairs)

Press **Add New Link** once per row. Check each DOI link opens before submitting. All five tables below are used by the final data files. The text-only rows are shown on the site with these links.

| Link Text | Link URL |
| --- | --- |
| NASA PSI-26 Burning and Suppression of Solids (BASS), v4, DOI 10.60555/58h4-dy80 | https://doi.org/10.60555/58h4-dy80 |
| NASA PSI-25 Burning and Suppression of Solids II (BASS-II), v4, DOI 10.60555/4qc4-de67 | https://doi.org/10.60555/4qc4-de67 |
| NASA PSI-101 Smoke Aerosol Measurement Experiment-Reflight (SAME-R), v4, DOI 10.60555/2np7-jv14 | https://doi.org/10.60555/2np7-jv14 |
| NASA PSI-69 Flame Extinguishment Experiment (FLEX), v5, DOI 10.60555/mbq8-0451 | https://doi.org/10.60555/mbq8-0451 |
| NASA PSI-159 ACME Cool Flames Investigation with Gases (CFI-G), v1, DOI 10.60555/cyt1-kh64 | https://doi.org/10.60555/cyt1-kh64 |
| NASA Physical Sciences Informatics (PSI) Data Repository | https://psi.nasa.gov/physci/repo |
| NASA PSI-98 Saffire-I (text-only entry) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-98 |
| NASA PSI-99 Saffire-II (text-only entry) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-99 |
| NASA PSI-100 Saffire-III (text-only entry) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-100 |
| NASA PSI-102 Smoke Aerosol Measurement Experiment, SAME (text-only entry) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-102 |
| NASA Glenn, Sheredy, "Fundamental Research Applied To Enable Hardware Performance in Microgravity" (DAFT, text-only entry) | https://ntrs.nasa.gov/citations/20050215648 |
| NASA ACME (BRE, s-Flame, Flame Design, CLD Flame, E-FIELD Flames, text-only entries) | https://science.nasa.gov/mission/acme |
| NASA Saffire spacecraft fire safety demonstration (PDF) | https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf |
| NASA Technical Paper, Detailed Results from the Flame Extinguishment Experiment (FLEX), NASA/TP-2015-216046 | https://ntrs.nasa.gov/citations/20150023456 |
| NASA exploration atmosphere: Siders et al., Effects of Mild Hypobaric Hypoxia on Response From Mild Exercise in NASA Exploration Atmosphere Tests, AsMA 2024 | https://ntrs.nasa.gov/citations/20230015594 |
| NASA exploration atmosphere: Sanders et al., Medical Lessons Learned from the Exploration Atmospheres Study, AsMA 2023 | https://ntrs.nasa.gov/citations/20220015741 |
| Space Apps challenge page: Flame in Freefall (Moon-habitat oxygen and pressure figures) | https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ |
| HUMAN: the NASA presentation that inspired the experiment viewer (title and URL), if one was used | HUMAN |

The Saffire PSI ids (98, 99, 100) and SAME (102) are marked "to verify" in `docs/references.md`. Open each link before submitting and delete the row if it does not match. HUMAN: the team also mentioned a "PSI-47" id that is not in the repo. Add or correct a row only after checking that link.

### 3.8 Space Agency Partner & Other Data (Link Text + Link URL pairs)

- **Form text:** list all other data, resources and tools used, **including code, text and images, even if open source or freely available**. All links must be public and be full URLs.
- Our originality checkbox (3.9) says every external resource is listed in 3.7 or 3.8, so this list must be complete.

Rows read from `web/package.json`, `data/pyproject.toml`, `ai/pyproject.toml`, `web/app/layout.tsx`, `web/public/` and `docs/references.md`:

| Link Text | Link URL |
| --- | --- |
| This project's source code (Flame in Freefall, MIT licence) | https://github.com/Gowrikamahesh17/agni-astra-fire-safety |
| Next.js 16 (MIT) | https://nextjs.org |
| React 19 (MIT) | https://react.dev |
| Chart.js 4 (MIT), charts | https://www.chartjs.org |
| MiniSearch 7 (MIT), chat retrieval and test search | https://lucaong.github.io/minisearch/ |
| TypeScript, ESLint, Vitest (dev tools) | https://vitest.dev |
| Geist and Geist Mono fonts (OFL), via Google Fonts | https://fonts.google.com/specimen/Geist |
| Noto Sans Devanagari font (OFL), via Google Fonts | https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari |
| pandas (BSD-3-Clause) | https://pandas.pydata.org |
| NumPy (BSD-3-Clause) | https://numpy.org |
| scikit-learn (BSD-3-Clause) | https://scikit-learn.org |
| jsonschema (MIT) | https://github.com/python-jsonschema/jsonschema |
| httpx (BSD-3-Clause), PyYAML (MIT), python-dotenv (BSD-3-Clause) | https://www.python-httpx.org |
| pytest and Ruff (dev tools) | https://docs.pytest.org |
| Groq API and the openai/gpt-oss-120b model | https://console.groq.com |
| Vercel (hosting) | https://vercel.com |
| Gemini: AI-generated home-page astronaut illustration (labelled "AI-generated image") | https://gemini.google.com |
| remove.bg: automatic background removal for that illustration | https://www.remove.bg |
| Claude Code (Anthropic): AI-assisted code and documentation | https://claude.com/claude-code |
| Team photos on the `/team` page (`web/public/team/`). HUMAN: confirm they are the team's own photos, and whether any was edited or AI-generated | HUMAN |
| HUMAN: any other icons, images or code copied from elsewhere. `web/app/icon.svg` is drawn for this project (`docs/references.md`) | HUMAN |

### 3.9 Project Submission Verification

- [ ] **Agree to Terms and Conditions *:** "I have read and understand the project submission requirements contained in the NASA Space Apps Project Submission Guide, and I agree to the Participant Terms and Conditions and Privacy Policy."
- [ ] **Confirm All Work is Original *:** the work is our team's own, **all external resources including code, text and images are listed in the NASA Data and Space Agency Partner & Other Data fields**, and we used no copyrighted material (music, images, text) without permission.

Only people who have really read and agreed should leave these ticked. Re-read both statements before submitting.

### 3.10 Save and submit

- [ ] Click **Save Progress** often (this makes the text public on the team page, and it is not a submission).
- [ ] Before the final click, re-open the saved Project tab and read it as a judge would.
- [ ] Click **Submit for Judging**, then confirm the success banner appears.
- [ ] The form also shows a "Project Requires Submission for Judging" status line and a **Lock** button. Their exact behaviour was not tested; check what they do before the deadline.
- [ ] Resubmit after any later change. Only the last saved submission is judged.

---

## 4. Demo: slide deck (7 slides or fewer)

**Requirements from the guide:** at most 7 slides including title and introduction · readable font size and few words per slide · strong visuals · English · public link · must include **team name, names of team members, the challenge we chose** · visuals must show **an image of the project**, **the user experience**, and **how NASA and space-agency open data and technology make the solution possible**. Judges also use the demo for the Presentation score.

Keep every slide to about 30 words plus one image. HUMAN: take the screenshots first and save them in `docs/demo/screenshots/` (folder created, empty).

| # | Slide | Content | Visual |
| --- | --- | --- | --- |
| 1 | **Title** | Flame in Freefall; Fire safety for crew habitats, from NASA's microgravity data; team: BrahmAstra Analytics; members: Gowrika Mahesh, Utkarsh Sawant, Arun Kumar; challenge: *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data* | The home-page astronaut illustration, with its visible "AI-generated image" label, and **no NASA logos or wording** |
| 2 | **Why it matters** (introduction) | Flames behave differently without gravity; Moon habitats will likely hold 30 % oxygen or more at 10.2 psi or less, which can make materials burn more easily; decades of experiments are hard to search and compare | The gravity flame on the home page (tall Earth flame next to a round microgravity flame), labelled as an illustration |
| 3 | **Our solution** | One sentence: rank, search and trace NASA combustion tests, with a source row on every finding | Dashboard screenshot: the ranking page |
| 4 | **User experience** | Three steps: pick a scenario and set weights, open an investigation and search its tests, click a finding to see its source row; optional chat | Three screenshots in a row, numbered (Dashboard, investigation page, Evidence gaps or chat) |
| 5 | **NASA data behind it** | 967 tests from 5 PSI investigations (6 tables), plus 10 text-only entries; CC0-1.0, cited by DOI; 20 tests have Moon-range chamber air; no partial-gravity data exists | Small pipeline picture: PSI CSV, clean, JSON, dashboard |
| 6 | **How we keep it honest** | Baseline FLEX model: balanced accuracy 0.787 against 0.500 for guessing, with a warning outside its range; AI text number-checked and reviewed (15 of 15 summaries, 8 of 8 implications); chat refuses when unsure | Screenshot of the Predict page, a source chip or a refused chat answer |
| 7 | **Impact and next steps** | For researchers and engineers choosing experiments; general Earth applications, labelled as context, not measured results; ready for LUCI and FM2 partial-gravity data when published; links to the live site and repo; one-line AI disclosure | QR code or short link, and the team |

**Hosting the deck:** Google Slides ("Anyone with the link can view") or a PDF committed to the **public** GitHub repo. Test the link in a private window.

### 4b. If we make a 30-second video instead

Total 30 seconds or less, English or English subtitles, no one under 18 on screen. Timings follow the guide:

| Time | Say or show |
| --- | --- |
| 0:00 | Name and team name |
| 0:02 | The challenge we chose and why: fire in microgravity and Moon habitats |
| 0:05 | Project title and tagline |
| 0:10 | The dashboard in use (ranking, then a click to a source row), naming NASA's PSI data and DOIs |
| 0:20 to 0:30 | Looking ahead: what it could do for habitat safety; where to find it |

---

## 5. Judging criteria and our evidence

Each of five criteria is scored 1 to 5. One piece of evidence per row, all present in the repo:

| Criterion | Evidence we show | Where in the repo or site |
| --- | --- | --- |
| **Impact** | Helps researchers and engineers choose experiments for Moon and Mars habitat fire safety, and shows where evidence is missing (20 of 967 tests with Moon-range chamber air); general Earth applications, labelled as context, not measured results | Dashboard, Evidence gaps, Implications, home page "Why it matters on Earth" block |
| **Creativity** | Every finding links to its source row; a chatbot that refuses to guess; scroll story, gravity flame and flame meter | Investigation pages, `web/lib/chat/`, `web/components/ScrollDive.tsx`, `GravityFlame.tsx`, `FlameMeter.tsx` |
| **Validity** | Real PSI data with DOIs; documented scoring formula; model card with limits and a known-limitation note; AI text verified against data; tests on both sides | `docs/model-card.md`, `ai/src/ffd_ai/verify_numbers.py`, `data/tests/`, `web/lib/*.test.ts` |
| **Relevance** | PSI data is core to every page; the dashboard, gaps, implications, predict and chat pages each address the challenge | `data/`, all pages |
| **Presentation** | Clear home page and Guide, team page, light and dark themes, accessibility options, demo, complete form | Home page, `/guide`, `/team`, section 4 |

---

## 6. Final checks (do these in order before the final submit)

- [ ] No `{{` placeholders remain in this file, and all `HUMAN:` items are resolved.
- [ ] Every number in the form, slides and site matches section 2.
- [ ] The live URL opens in a private window with no login, and every page loads. Ask the chat one question to confirm the Groq key is set on Vercel.
- [x] The repo is public (confirmed). Check it still has a README, licence and `.env.example` (no real keys anywhere in the git history).
- [ ] The demo link opens with no login; slides <= 7 or video <= 30 s; English.
- [ ] Every DOI link in 3.7 opens, and the "to verify" PSI ids (98, 99, 100, 102) point to the right investigations.
- [ ] Section 3.8 lists every library, font, icon, image and AI tool actually used.
- [ ] AI disclosure is present in `docs/ai-disclosure.md`, the site footer and the project text.
- [ ] AI-generated images are labelled. No NASA logos, flags or mission identifiers appear in any AI-generated image. `docs/ai-disclosure.md` says the astronaut image was regenerated to remove a national flag; check the final image once more.
- [ ] No one under 18 appears in any image, video or audio. The `/team` page now shows three team photos (`web/public/team/`): confirm each person is an adult and agreed to publication.
- [ ] All teammates are on the Members tab for the same Local Event.
- [ ] Both verification boxes are ticked by someone who has read them, then **Submit for Judging** is clicked and the banner is confirmed.
- [ ] Re-open the saved Project tab and read it as a judge would.

---

## 7. Sources

- Project Submission Guide: https://www.spaceappschallenge.org/resources/project-submission-guide/
- Judging and Awards Guide: https://www.spaceappschallenge.org/resources/judging-awards-guide/
- Participant FAQs: https://www.spaceappschallenge.org/resources/participant-faqs/
- Flame in Freefall challenge page: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
- NASA PSI Data Repository: https://psi.nasa.gov/physci/repo
- Form fields, labels and the SI options in section 3 were read from the live Project tab on 2026-11-15.
