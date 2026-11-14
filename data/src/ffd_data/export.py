import json
import math

from ffd_data import CONTRACT_VERSION, OUT_DIR, SCORE_FORMULA_VERSION
from ffd_data.clean_bass import clean_bass
from ffd_data.clean_bass2 import clean_bass2
from ffd_data.clean_cfig import clean_cfig
from ffd_data.clean_flex import clean_flex
from ffd_data.clean_samer import clean_samer
from ffd_data.metadata import base_records
from ffd_data.scenarios import build_scenarios
from ffd_data.scoring import add_distances, scenario_components, static_scores
from ffd_data.validate import validate_file

CLEANERS = [clean_flex, clean_cfig, clean_bass2, clean_bass, clean_samer]


def build_observations():
    observations = [obs for cleaner in CLEANERS for obs in cleaner()]
    add_distances(observations)
    return observations


def _range(values):
    values = [v for v in values if v is not None]
    return [min(values), max(values)] if values else None


def build_investigations(observations):
    by_id = {}
    for obs in observations:
        by_id.setdefault(obs["investigation_id"], []).append(obs)
    investigations = []
    for record in base_records():
        rows = by_id.get(record["id"], [])
        record.update(
            n_observations=len(rows),
            o2_pct_range=_range(o["o2_pct"] for o in rows),
            pressure_bar_range=_range(o["pressure_bar"] for o in rows),
            scenario_components=scenario_components(rows),
            static_scores=static_scores(record, rows),
            score_formula_version=SCORE_FORMULA_VERSION,
        )
        investigations.append(record)
    return investigations


def _clean_nan(value):
    if isinstance(value, float) and math.isnan(value):
        return None
    if isinstance(value, dict):
        return {k: _clean_nan(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_clean_nan(v) for v in value]
    return value


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(_clean_nan(payload), f, ensure_ascii=False, indent=1)
        f.write("\n")


def wrap(items):
    return {"contract_version": CONTRACT_VERSION, "items": items}


def build_all():
    observations = build_observations()
    return {
        "observations.json": wrap(observations),
        "investigations.json": wrap(build_investigations(observations)),
        "scenarios.json": wrap(build_scenarios()),
    }


def main(out_dir=OUT_DIR):
    for name, payload in build_all().items():
        path = out_dir / name
        write_json(path, payload)
        validate_file(path)
        print(f"wrote {path.relative_to(out_dir.parents[2])} ({len(payload['items'])} items)")


if __name__ == "__main__":
    main()
