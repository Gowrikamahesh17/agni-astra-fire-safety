# Submission Pack: BrahmAstra Analytics · Flame in Freefall

NASA Space Apps Challenge 2026 · challenge: *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*

**Deadline: Sunday 15 Nov 2026, 11:59 p.m. in the time zone of our Local Event** (confirm the exact cutoff with the Local Lead). Internal target: submit by 18:00. Only the last saved submission is judged, and we can resubmit until the deadline.

Suggested location in the repo: `docs/demo/SUBMISSION.md` (owned by Person C in the plan, so no CODEOWNERS change is needed).

---

## 0. How to use this file

> **For Claude Code:** fill this file from the code in this repository. Work in this order.
>
> 1. Fill the **Facts sheet** (section 2) first by reading the repo. Every `{{PLACEHOLDER}}` in later sections takes its value from that sheet, so the numbers can never disagree between the form, the slides and the site.
> 2. Then write each section's draft text with the facts substituted.
> 3. **Never invent a number, URL, name or feature.** If the code does not show it, write `HUMAN:` followed by what is needed, and leave it for the team.
> 4. Obey every limit in the "Limits" lines (word counts, character counts, slide counts). Count them and write the count in the "Check" line.
> 5. When done, run `grep -n "{{\|TODO" docs/demo/SUBMISSION.md`. It must print nothing. `HUMAN:` items may remain, but list them at the top of your final reply.
> 6. Do not commit secrets. The form's "Save Progress" button publishes the text on our public team page, so nothing private belongs in it.

Marker meanings: `{{NAME}}` = fill from code · `HUMAN:` = only the team knows · `[ ]` = a task to tick.

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
- **Saving is public:** "Save Progress" makes the content visible to anyone who visits the team page. It does **not** submit. Only **Submit for Judging** does.

---

## 2. Facts sheet (single source of truth)

> **For Claude Code:** fill the "Value" column. "Where" says how.

| Placeholder | Value | Where |
| --- | --- | --- |
| `{{PROJECT_NAME}}` | | HUMAN: pick one spelling. The team page uses both "BrahmAstra" and "BrahmAshtra", and the form default is "Project BrahmAshtra Analytics". Use one everywhere. |
| `{{TAGLINE}}` | | One line, 12 words or fewer, from the README's first paragraph |
| `{{TEAM_MEMBERS}}` | | HUMAN: full names as on the team page's Members tab |
| `{{LIVE_URL}}` | | HUMAN: production URL on Vercel; open it in a private window and confirm it needs no login |
| `{{REPO_URL}}` | | `git remote get-url origin`, as an `https://` URL; the repo must be public |
| `{{DEMO_URL}}` | | HUMAN: public link to the slides or video |
| `{{N_TABLES}}` | | Count of CSV files in `data/raw/psi/` |
| `{{N_INVESTIGATIONS}}` | | Length of `web/public/data/investigations.json` |
| `{{N_OBSERVATIONS}}` | | Length of `web/public/data/observations.json` |
| `{{MOON_WINDOW_COUNT}}` | | Count of observations with `in_moon_window: true` (30% oxygen or more at 0.7033 bar / 10.2 psi or less) |
| `{{PAGES}}` | | Routes under `web/app/` |
| `{{SCORE_FORMULA}}` | | `data/src/ffd_data/scoring.py` and its `formula_version`, in one plain sentence |
| `{{MODEL_TASK}}`, `{{MODEL_METRIC}}` | | `web/public/data/models/*.json`: `task`, `metrics` (rows, cross-validation score), `valid_range` |
| `{{GROQ_MODEL}}` | | `ai/config.yaml`, `model`; also check it is not a model from a Chinese lab if the team decided to avoid those |
| `{{N_SUMMARIES}}`, `{{N_SUMMARIES_VERIFIED}}` | | `web/public/data/summaries.json`: total, and count with `verified: true` |
| `{{WEB_DEPS}}` | | `web/package.json` dependencies with versions and licences |
| `{{PY_DEPS}}` | | `data/pyproject.toml` and `ai/pyproject.toml` |
| `{{SCREENSHOTS}}` | | Files in `docs/demo/screenshots/` (ask Person A for 6 to 8 clean shots) |

Fixed facts we already verified (still re-check against the repo):

- PSI combustion science lists 24 investigations; all but one show licence CC0-1.0.
- The challenge page says PSI holds no partial-gravity combustion data today (LUCI and FM2 are planned).
- Moon-habitat air is expected to be **30% oxygen or more at 10.2 psi or less**, against about 21% at 14.7 psi on Earth (challenge page).
- 20 of 967 tests have Moon-range chamber air (CFI-G normal flames). 28 CFI-G inverse-flame tests are excluded because their oxygen value describes the burner stream, not the chamber. FLEX and BASS-II have none.

---

## 3. The project form (live form fields, in order)

Where: team page, **Project** tab, **Edit**. Fields marked * are required.

### 3.1 Project Name

- **Form text:** "Give your project a title that helps describe what your team worked on." Short, saying what problem it solves.
- **Limit:** none shown. Keep it under 70 characters.
- **Draft:** `{{PROJECT_NAME}}: {{TAGLINE}}`
- **Check:** characters = `___`

### 3.2 Summary *

- **Form text:** "What did you develop? How does it address the challenge? Why is it important?"
- **Limits:** suggested 50 to 200 words; the form's counter stops at **1500 characters**.
- **Draft** (replace placeholders, keep it factual, no hype):

> {{PROJECT_NAME}} is a web dashboard that turns NASA's microgravity combustion experiments into ranked, searchable fire-safety insight for Moon and Mars habitats. We cleaned {{N_TABLES}} experimental tables from {{N_INVESTIGATIONS}} investigations in NASA's Physical Sciences Informatics (PSI) repository into {{N_OBSERVATIONS}} individual test records. Users rank investigations with adjustable weights for oxygen, pressure, habitat relevance and data usability, search and group the tests, and click any finding to see the exact source row. AI-written summaries and a chatbot are checked against the data and answer "not in the PSI data" instead of guessing. Only {{MOON_WINDOW_COUNT}} of {{N_OBSERVATIONS}} tests match Moon-habitat air, and PSI has no partial-gravity data, so the dashboard shows that gap openly. It helps researchers and engineers decide which experiments matter before habitats are built.

- **Check:** words = `___` (50 to 200), characters = `___` (1500 or fewer)

### 3.3 Project Links: Project Demonstration *

- **Form text:** a slide presentation (7 slides or fewer, including title and introduction) or a video (30 seconds or less), on a public host, link needing no password, permission or registration.
- **Value:** `{{DEMO_URL}}` (full URL with `https://`)
- **Check:** opens in a private window; slides <= 7 or video <= 30 s. Build it from section 4.

### 3.4 Project Links: Project *

- **Form text:** a public link to the final project (website, hosting service or code repository). No password, permission or registration.
- **Value:** `{{LIVE_URL}}` (the repo `{{REPO_URL}}` goes in the details text and the link lists)
- **Check:** every page loads in a private window; the site works with the chatbot switched off.

### 3.5 Project Information: Project Details *

- **Form text:** what it does and how it works, benefits, intended impact, tools, languages, hardware and software, how it is creative, factors the team considered.
- **Editor:** a rich-text box (bold, italics, underline, links). No limit is shown; keep to **about 400 to 700 words**. Use short bold lead-ins instead of long headings.
- **Draft skeleton** (fill from the code; delete any line the code does not support):

> **What it does.** {{PROJECT_NAME}} ranks and explains NASA combustion experiments for crew-habitat fire safety. Pages: {{PAGES}}.
>
> **How it works.** Python pipelines clean the PSI experimental tables offline into JSON; the Next.js site serves those files. Every observation keeps its source file and row. Ranking uses: {{SCORE_FORMULA}}
>
> **Data.** {{N_OBSERVATIONS}} test records from {{N_INVESTIGATIONS}} PSI investigations, all CC0-1.0 and cited by DOI (see the NASA Data list).
>
> **Prediction.** A simple baseline model: {{MODEL_TASK}}; {{MODEL_METRIC}}. The weights are exported to JSON and run in the browser. It is only valid inside the tested range, and the interface warns when an input falls outside it.
>
> **AI.** {{N_SUMMARIES_VERIFIED}} of {{N_SUMMARIES}} summaries were written by {{GROQ_MODEL}} (via Groq) from computed facts, then checked: every number must appear in the source data and a person read each one. The chatbot answers only from retrieved rows, cites them, and refuses when the data does not support an answer.
>
> **Tools.** {{WEB_DEPS}}; {{PY_DEPS}}; hosting on Vercel; code at {{REPO_URL}}.
>
> **Creativity.** Every finding links back to its exact source row; the chatbot is built to say "not in the data".
>
> **Factors we considered.** No partial-gravity data exists, so Moon and Mars gravity are not modelled; only {{MOON_WINDOW_COUNT}} tests match Moon-habitat air; tables record different columns, so we normalised units and labels (pressure to bar, oxygen to percent).
>
> **Impact.** Helps researchers and engineers find the experiments that matter for habitat fire safety, and points to Earth uses such as water-mist extinguishers, smoke detection and firefighter gear.
>
> **Links.** Live site: {{LIVE_URL}} · Code: {{REPO_URL}} · Demo: {{DEMO_URL}}

- **Check:** words = `___`; every claim matches a fact in section 2.

### 3.6 Use of Super Intelligence (SI) *

- **Form text:** a multi-select. "Select all that apply." The answer is for data collection and is **not seen by judges**, but judges do see watermarks, descriptive text and metadata in the project itself.
- **Options on the form:** Ideation or Brainstorming · Research or Information Gathering · Data Analysis and Interpretation · Building SI/ML Into the Project · Coding, Debugging, or Troubleshooting · Writing, Editing, or Translation · Visual Design or Image Creation · Presentation, Video, or Audio · Other Project-Related SI Use · None / Did not use SI or SI tools.
- **Our suggested answers.** The team confirms each tick honestly:

| Option | Likely | Evidence |
| --- | --- | --- |
| Ideation or Brainstorming | Yes | AI helped plan the architecture, tech stack and work split. The solution idea itself comes from the challenge text and NASA's own presentation, not from AI. |
| Research or Information Gathering | Yes | AI read the challenge pages, submission guides and the PSI repository. |
| Data Analysis and Interpretation | Yes | AI profiled the experimental tables. |
| Building SI/ML Into the Project | Yes | Groq-hosted model for summaries and chatbot; scikit-learn baseline model. |
| Coding, Debugging, or Troubleshooting | Yes | Claude and Claude Code wrote or reviewed code. |
| Writing, Editing, or Translation | Yes | AI drafted summaries and form text. |
| Visual Design or Image Creation | Yes | Header image generated with Gemini; prototype UI drafted with Claude. |
| Presentation, Video, or Audio | HUMAN | Tick only if AI helped make the slides or video. |
| Other Project-Related SI Use | HUMAN | |
| None / Did not use SI or SI tools | No | Do not combine with the others. |

> **For Claude Code:** also create or update `docs/ai-disclosure.md` and the site footer with this text, adjusted to the code: *"Summaries and chat answers on this site are AI-generated by {{GROQ_MODEL}} via Groq and checked against NASA PSI data. Parts of the code and documentation were written with Claude and Claude Code. The header image was generated with Gemini and carries an AI watermark."* Add `Generated-by` notes in the headers of AI-assisted source files if the team wants metadata-level acknowledgement.

### 3.7 NASA Data * (Link Text + Link URL pairs)

Press **Add New Link** once per row. **Keep a row only if the final data files use that investigation, and add rows for any other PSI investigation or NASA page we used.** Check each DOI link opens before submitting.

> **For Claude Code:** compare this list with `data/raw/psi/` and `investigations.json`, remove unused rows, and add every NASA source that appears in the code or docs.

| Link Text | Link URL |
| --- | --- |
| NASA PSI-26 Burning and Suppression of Solids (BASS), v4, DOI 10.60555/58h4-dy80 | https://doi.org/10.60555/58h4-dy80 |
| NASA PSI-25 Burning and Suppression of Solids II (BASS-II), v4, DOI 10.60555/4qc4-de67 | https://doi.org/10.60555/4qc4-de67 |
| NASA PSI-101 Smoke Aerosol Measurement Experiment-Reflight (SAME-R), v4, DOI 10.60555/2np7-jv14 | https://doi.org/10.60555/2np7-jv14 |
| NASA PSI-69 Flame Extinguishment Experiment (FLEX), v5, DOI 10.60555/mbq8-0451 | https://doi.org/10.60555/mbq8-0451 |
| NASA PSI-159 ACME Cool Flames Investigation with Gases (CFI-G), v1, DOI 10.60555/cyt1-kh64 | https://doi.org/10.60555/cyt1-kh64 |
| NASA Physical Sciences Informatics (PSI) Data Repository | https://psi.nasa.gov/physci/repo |
| Space Apps challenge page: Flame in Freefall (Moon-habitat oxygen and pressure figures) | https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ |
| HUMAN: the NASA presentation that inspired the experiment viewer (title and URL) | HUMAN |

### 3.8 Space Agency Partner & Other Data (Link Text + Link URL pairs)

- **Form text:** list all other data, resources and tools used, **including code, text and images, even if open source or freely available**. All links must be public and be full URLs.
- **Not required to have rows, but our originality checkbox (3.9) says every external resource is listed in 3.7 or 3.8**, so this list must be complete.

> **For Claude Code:** build one row per item from the code. Look in `web/package.json`, `data/pyproject.toml`, `ai/pyproject.toml`, `web/app/layout.tsx` and CSS for fonts, `web/public/` for images and icons, and the landing-page code for any copied snippets. Use each package's real homepage or repository URL and its licence. Do not list anything you cannot find in the repo.

Rows to start from (confirm each against the code):

| Link Text | Link URL |
| --- | --- |
| This project's source code ({{PROJECT_NAME}}) | {{REPO_URL}} |
| Next.js | https://nextjs.org |
| React | https://react.dev |
| HUMAN or code: search library (Fuse.js or MiniSearch) | from `package.json` |
| HUMAN or code: charting library, if any | from `package.json` |
| pandas | https://pandas.pydata.org |
| scikit-learn | https://scikit-learn.org |
| Groq API and the {{GROQ_MODEL}} model | https://console.groq.com |
| Vercel (hosting) | https://vercel.com |
| Gemini: AI-generated team header image | https://gemini.google.com |
| Claude / Claude Code (Anthropic): AI-assisted code, plan and analysis | https://claude.ai |
| HUMAN: fonts, icons and any other images or code, with licences | HUMAN |

### 3.9 Project Submission Verification

- [ ] **Agree to Terms and Conditions *:** "I have read and understand the project submission requirements contained in the NASA Space Apps Project Submission Guide, and I agree to the Participant Terms and Conditions and Privacy Policy."
- [ ] **Confirm All Work is Original *:** the work is our team's own, **all external resources including code, text and images are listed in the NASA Data and Space Agency Partner & Other Data fields**, and we used no copyrighted material (music, images, text) without permission.

Both boxes already appeared ticked from an earlier save when this form was read, but only people who have really read and agreed should leave them ticked. Re-read both statements before submitting.

### 3.10 Save and submit

- [ ] Click **Save Progress** often (this makes the text public on the team page, and it is not a submission).
- [ ] Before the final click, re-open the saved Project tab and read it as a judge would.
- [ ] Click **Submit for Judging**, then confirm the success banner appears.
- [ ] The form also shows a "Project Requires Submission for Judging" status line and a **Lock** button. Their exact behaviour was not tested; check what they do before the deadline.
- [ ] Resubmit after any later change. Only the last saved submission is judged.

---

## 4. Demo: slide deck (7 slides or fewer)

**Requirements from the guide:** at most 7 slides including title and introduction · readable font size and few words per slide · strong visuals · English · public link · must include **team name, names of team members, the challenge we chose** · visuals must show **an image of the project**, **the user experience**, and **how NASA and space-agency open data and technology make the solution possible**. Judges also use the demo for the Presentation score.

> **For Claude Code:** fill each slide's text from section 2, then reference real screenshot files from `docs/demo/screenshots/`. Keep every slide to at most about 30 words plus one image. Put speaker notes below each slide. If asked, build the deck as a `.pptx` or Google Slides outline; otherwise leave this as a content plan.

| # | Slide | Content | Visual |
| --- | --- | --- | --- |
| 1 | **Title** | `{{PROJECT_NAME}}`; `{{TAGLINE}}`; team: BrahmAstra Analytics; members: `{{TEAM_MEMBERS}}`; challenge: *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data* | AI-generated header image, with a visible "AI-generated" watermark and **no NASA logos or wording** |
| 2 | **Why it matters** (introduction) | Flames behave differently without gravity; Moon habitats will likely hold 30% oxygen or more at 10.2 psi or less, which makes materials burn more easily; decades of experiments are hard to search and compare | Earth flame vs microgravity flame illustration (label it an illustration) |
| 3 | **Our solution** | One sentence: rank, search and trace NASA combustion tests, with a source row on every finding | Dashboard screenshot: ranking page |
| 4 | **User experience** | Three steps: set weights and filter, open an investigation and search its tests, click a finding to see its source row; optional chat | Three screenshots in a row, numbered |
| 5 | **NASA data behind it** | `{{N_OBSERVATIONS}}` tests from `{{N_INVESTIGATIONS}}` PSI investigations, CC0-1.0, cited by DOI; `{{MOON_WINDOW_COUNT}}` in the Moon-habitat window; no partial-gravity data exists | Small pipeline picture: PSI CSV, clean, JSON, dashboard |
| 6 | **How we keep it honest** | Baseline model: `{{MODEL_TASK}}`, `{{MODEL_METRIC}}`; AI summaries checked against the data; chatbot refuses when unsure; limits stated | Screenshot of a source chip or a refused answer |
| 7 | **Impact and next steps** | For researchers and engineers choosing experiments; Earth uses; ready for LUCI and FM2 partial-gravity data when published; links: `{{LIVE_URL}}`, `{{REPO_URL}}`; one-line AI disclosure | QR code or short link, and the team |

**Hosting the deck:** Google Slides ("Anyone with the link can view") or a PDF committed to a **public** GitHub repo. Test the link in a private window.

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

Each of five criteria is scored 1 to 5. Add one real piece of evidence per row.

| Criterion | Evidence we show | Where in the repo or site |
| --- | --- | --- |
| **Impact** | Helps researchers and engineers choose experiments for Moon and Mars habitat fire safety; Earth applications | Dashboard, "Earth applications" note |
| **Creativity** | Every finding links to its source row; chatbot that refuses to guess | Viewer page, `web/lib/chat/` |
| **Validity** | Real PSI data with DOIs; documented scoring formula; model card with limits; AI text verified against data | `docs/model-card.md`, `ai/src/ffd_ai/verify_numbers.py` |
| **Relevance** | PSI data is core to every page; each challenge objective is addressed | `data/`, all pages |
| **Presentation** | Clear landing page, demo, complete form | Landing page, section 4 |

---

## 6. Final checks (do these in order before the final submit)

- [ ] `grep -n "{{\|TODO" docs/demo/SUBMISSION.md` prints nothing, and all `HUMAN:` items are resolved.
- [ ] Every number in the form, slides and site matches section 2.
- [ ] `{{LIVE_URL}}` opens in a private window with no login, and every page loads.
- [ ] `{{REPO_URL}}` is public and has a README, licence and `.env.example` (no real keys anywhere in the git history).
- [ ] `{{DEMO_URL}}` opens with no login; slides <= 7 or video <= 30 s; English.
- [ ] Every DOI link in 3.7 opens.
- [ ] Section 3.8 lists every library, font, icon, image and AI tool actually used.
- [ ] AI disclosure is present in `docs/ai-disclosure.md`, the site footer and the project text.
- [ ] AI-generated images are watermarked. No NASA logos, flags or mission identifiers appear in any AI-generated image. The team header image previously showed the words "NASA Space Apps Challenge"; regenerate or crop it to be safe.
- [ ] No one under 18 appears in any image, video or audio.
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
