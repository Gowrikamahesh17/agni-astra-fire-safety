# References

## NASA datasets

All tables come from the NASA Physical Sciences Informatics (PSI) repository, released under CC0-1.0. Files are stored unchanged in `data/raw/psi/`.

Cite as: NASA Physical Sciences Informatics (PSI) Data Repository, https://psi.nasa.gov/physci/repo (accessed 2026-11-14), CC0-1.0.

| Investigation | PSI id | Version | DOI | File(s) |
| --- | --- | --- | --- | --- |
| Flame Extinguishment Experiment (FLEX) | PSI-69 | v5 | [10.60555/mbq8-0451](https://doi.org/10.60555/mbq8-0451) | `PSI-69_Experimental table_FLEX.csv` |
| ACME Cool Flames Investigation with Gases (CFI-G) | PSI-159 | v1 | [10.60555/cyt1-kh64](https://doi.org/10.60555/cyt1-kh64) | `PSI-159_Experimental table_CFI-G_Normal Flames.csv`, `PSI-159_Experimental table_CFI-G_Inverse Flames.csv` |
| Burning and Suppression of Solids - II (BASS-II) | PSI-25 | v4 | [10.60555/4qc4-de67](https://doi.org/10.60555/4qc4-de67) | `PSI-25_Experimental table_BASS-II.csv` |
| Burning and Suppression of Solids (BASS) | PSI-26 | v4 | [10.60555/58h4-dy80](https://doi.org/10.60555/58h4-dy80) | `PSI-26_Experimental table_BASS.csv` |
| Smoke Aerosol Measurement Experiment-Reflight (SAME-R) | PSI-101 | v4 | [10.60555/2np7-jv14](https://doi.org/10.60555/2np7-jv14) | `PSI-101_Experimental table_SAME-R.csv` |

## Challenge

NASA Space Apps Challenge 2026, Flame in Freefall: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/

## Metadata-only investigations

| Investigation | Id | Source |
| --- | --- | --- |
| Saffire-I, II, III | PSI-98, PSI-99, PSI-100 (to verify) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-98 and following; https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf |
| SAME | PSI-102 (to verify) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-102 |
| ACME: BRE, s-Flame, Flame Design, CLD Flame, E-FIELD Flames | not in PSI | https://science.nasa.gov/mission/acme |
| DAFT | no PSI listing found (the PSI search page needs a browser, so confirm there) | W. A. Sheredy, "Fundamental Research Applied To Enable Hardware Performance in Microgravity", Research and Technology 2004, NASA Glenn, 2005: https://ntrs.nasa.gov/citations/20050215648 |

## Other NASA sources used

| Source | Used for |
| --- | --- |
| Choi, M. Y., Avedisian, C. T., et al. *Detailed Results from the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011*, NASA/TP-2015-216046, Nov 2015. https://ntrs.nasa.gov/citations/20150023456 | Confirms that the FLEX `CO` column is CO2 (Appendix A, Table IX) |
| Siders, B., et al. *Effects of Mild Hypobaric Hypoxia on Response From Mild Exercise in NASA Exploration Atmosphere Tests*, AsMA 94th Annual Scientific Meeting, May 2024. https://ntrs.nasa.gov/citations/20230015594 | Definition of the exploration atmosphere: 56.5 kPa (8.2 psia), 34 % O2, 66 % N2, described as an alternate habitat atmosphere the study aims to validate |
| Sanders, R., Ray, K., Law, J., Reyes, D. *Medical Lessons Learned from the Exploration Atmospheres Study*, AsMA 2023. https://ntrs.nasa.gov/citations/20220015741 | Describes 8.2 psia / 34 % O2 as a proposed alternative cabin environment for future habitats and planetary EVAs |

## Software

| Library | Use | License |
| --- | --- | --- |
| Python 3.12 | Data pipeline | PSF |
| pandas | Table loading | BSD-3-Clause |
| NumPy | Numerics | BSD-3-Clause |
| scikit-learn | Logistic and ridge regression, cross-validation | BSD-3-Clause |
| jsonschema | Contract validation | MIT |
| pytest | Tests | MIT |
| Ruff | Lint and format | MIT |

### Website (`web/`)

| Library or asset | Use | License |
| --- | --- | --- |
| Next.js 16 and React 19 | Web framework and UI | MIT |
| Chart.js 4 | Evidence gaps scatter chart | MIT |
| MiniSearch 7 | Search over test rows and chat retrieval | MIT |
| TypeScript, ESLint, Vitest | Type checking, linting and tests (development only) | Apache-2.0, MIT, MIT |
| Geist and Geist Mono (via `next/font/google`) | Typefaces | SIL Open Font License 1.1 |
| Noto Sans Devanagari (via `next/font/google`) | Typeface for the two Devanagari phrases in the team section (Agni Shant, Agni Rakshaks) | SIL Open Font License 1.1 |
| Flame icon (`web/app/icon.svg`) | Browser tab icon, drawn for this project | Project license (MIT) |
| Fire emoji on the home page | Unicode emoji drawn by the viewer's system font | n/a |
| Astronaut illustration (`web/public/images/astronaut.png`) | Home-page picture. AI-generated with Google Gemini (flag removed and fire extinguisher added by follow-up prompts), background removed with remove.bg. Labelled "AI-generated image" on the page. | Generated content; see `docs/ai-disclosure.md` |

## AI tools

| Tool | Use |
| --- | --- |
| Claude Code (Anthropic) | AI-assisted code and documentation for the data pipeline, models, contract and `web/lib/predict.ts`. All numbers were checked by tests against the source CSVs. |
| Claude Code (Anthropic) | AI-assisted code and interface text for the whole website (`web/`): pages, charts, chat panel, themes, help tips and the Guide page. Checked by automated tests, a linter and an accessibility scan. |
| Google Gemini | Generated the home-page astronaut illustration. |
| remove.bg | Automatic background removal for that illustration. |
| Open model on Groq (`openai/gpt-oss-120b`) | Summaries, implications and the chat assistant. See `docs/ai-disclosure.md`. |

Full AI disclosure: `docs/ai-disclosure.md`.
