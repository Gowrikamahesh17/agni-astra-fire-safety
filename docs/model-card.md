# Model card

Baseline models and the ranking score behind the dashboard. Everything is trained offline in `data/ml/` and exported as JSON to `web/public/data/models/`; the browser runs them with `web/lib/predict.ts`. No Python runs in production.

These are **baseline, microgravity-only** models for exploring the PSI data. They are not flight-qualified tools and must not be used for safety decisions.

## How a prediction is computed

```
z = bias + sum_i w_i * (x_i - mean_i) / std_i      numeric features
         + w_{feature=level}                       one-hot categories
p = 1 / (1 + e^-z)                                 classification
value = z                                          regression
```

Any input outside `valid_range` (the min and max seen in training), missing, or an unknown category is returned in `out_of_range`, and the site shows a warning. Each model file has about 20 fixtures; `predict.test.ts` and `data/tests/test_models.py` check that both implementations reproduce them.

## flex_extinction (primary)

| | |
| --- | --- |
| Question | Will a FLEX droplet flame go out before the fuel is used up? |
| Rows | FLEX (PSI-69) tests with pressure > 0 and a droplet diameter: 261 |
| Target | 1 = `extinguished`, 0 = `disrupted` or `burned_to_completion` (69 % positive) |
| Features | `fuel` (one-hot), `pressure_bar`, `o2_pct`, `co2_pct`, `he_pct`, `droplet_d0_mm` |
| Excluded | Extinction diameter, burning rate, burn time (only known after the test) |
| Method | Logistic regression, `class_weight="balanced"`, standardized numeric features |
| Validation | Stratified 5-fold CV, seed 42 |
| Balanced accuracy | **0.787** (majority-class baseline 0.500) |
| ROC AUC | **0.870** |
| Valid range | O2 12-34 %, 0.70-3.09 bar, CO2 0-70 %, He 0-45 %, droplet 1.1-4.67 mm |

Standardized weights: O2 -1.98, droplet diameter +0.79, He +0.47, CO2 +0.30, pressure -0.01, methanol vs heptane +1.08.

The expected trends hold: more O2 lowers the chance of extinction, and more CO2 or helium raises it. Pressure adds almost nothing once composition is known.

## cfig_self_extinction (secondary)

| | |
| --- | --- |
| Question | Will an ignited CFI-G gas flame go out by itself? |
| Rows | CFI-G (PSI-159) rows with `ignited = true`: 272 |
| Target | 1 = `self_extinguished`, 0 = `sustained_until_stopped` |
| Features | `o2_pct`, `pressure_bar`, `fuel` (one-hot), `fuel_fraction_pct`, `flame_type` (one-hot) |
| Excluded | Burn time, peak burner temperature, post-test O2 |
| Method / validation | As above |
| Balanced accuracy | **0.679** (baseline 0.500) |
| ROC AUC | **0.734** |
| Valid range | O2 13.5-85 %, 0.50-3.31 bar, fuel fraction 5.6-100 % |

Limitations:

- `sustained_until_stopped` rows are **censored**: the flame was still burning when the flow was cut, the test timed out or the burner hit its temperature limit. They would probably have burned longer.
- In normal flames every sustained row is at O2 >= 33 %, so O2 dominates. Normal flames self-extinguish less as O2 rises (100 % at O2 <= 30 %, 66 % above).
- Inverse flames show the **opposite** trend (39 % self-extinction at O2 <= 21 %, about 67 % above 40 %), because O2 comes from the burner and the atmosphere is fuel. The spec's single shared O2 feature averages the two, giving a small O2 weight (+0.20). Read the flame types separately on the site.

## flex_burning_rate (optional)

Ridge regression (alpha = 1) on the same FLEX features, target `burning_rate_mm2_s`, 257 rows. 5-fold CV: R² **0.713**, MAE **0.047 mm²/s** vs 0.107 for predicting the mean. O2 has the largest effect (+0.091 mm²/s per standard deviation).

## Ranking score (formula version 2.0)

Computed offline in `data/src/ffd_data/scoring.py` and combined with user weights in the browser.

**Distance** from a test to a scenario:

```
d = sqrt( ((o2_pct - O2_s) / 5)^2 + ((pressure_bar - P_s) / 0.10)^2 )
```

5 percentage points of O2 and 0.10 bar each count as one unit. Tests without O2 or pressure have no distance.

**Per investigation and scenario:** `d_min` = smallest d; `n_near` = tests with d <= 1; `proximity = round(100 * max(0, 1 - d_min / 3))`. Metadata-only entries have no proximity.

**fire_safety_relevance** (static, by first role):

| Role | Score | Investigations |
| --- | --- | --- |
| Solid-fuel prevention | 100 | BASS, BASS-II, Saffire I-III |
| Suppression | 90 | FLEX |
| Detection | 90 | SAME-R, SAME, DAFT |
| Gas-leak flame behaviour | 70 | CFI-G, other ACME experiments |

**data_usability** (static): +40 measured outcome column, +30 O2 and pressure, +20 at least 100 rows, +10 source rows. Text-only entries get 20.

| Investigation | Outcome | O2 + pressure | n >= 100 | Source rows | Total |
| --- | --- | --- | --- | --- | --- |
| FLEX | 40 | 30 | 20 | 10 | 100 |
| CFI-G | 40 | 30 | 20 | 10 | 100 |
| BASS-II | 0 | 0 (no pressure) | 20 | 10 | 30 |
| BASS | 0 | 0 | 20 | 10 | 30 |
| SAME-R | 0 | 0 | 20 | 10 | 30 |
| Metadata-only | | | | | 20 |

**Site score** = weighted mean of proximity, fire_safety_relevance and data_usability (default weights 0.5 / 0.3 / 0.2, adjustable on the dashboard).

Check: for `lunar_habitat`, FLEX has `n_near = 17`, `d_min = 0.093`, proximity 97. All 17 near tests ended in disruption (15) or completion (2); none in extinction.

## Known limitation: inverse-flame oxygen

In CFI-G inverse flames the `o2_pct` value is the oxidizer stream from the burner, not the chamber air (the chamber holds fuel). The distance, proximity and `n_near` scores above still treat that value as the test atmosphere, so inverse-flame tests can look closer to a scenario than their chamber air really is. The scoring code is unchanged. Moon-range counts are different: they exclude inverse flames, so only the 20 normal-flame tests (of 333 CFI-G tests) count as having Moon-range chamber air. The Evidence gaps chart plots inverse-flame points at burner-stream oxygen and says so.

## Reproduce

```bash
cd data
python -m ffd_data          # data, models, contract examples
python -m pytest
```
