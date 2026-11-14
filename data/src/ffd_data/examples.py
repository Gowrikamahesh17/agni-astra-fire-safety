import json

from ffd_data import CONTRACT_DIR, MODELS_DIR
from ffd_data.export import build_all, wrap, write_json
from ffd_data.validate import validate_file

EXAMPLES_DIR = CONTRACT_DIR / "examples"
EXAMPLE_INVESTIGATIONS = ["PSI-69", "PSI-159", "PSI-98"]
EXAMPLE_OBSERVATIONS = [
    "PSI-69-0001",
    "PSI-69-0024",
    "PSI-69-0081",
    "PSI-69-0040",
    "PSI-159-0001",
    "PSI-159-0010",
    "PSI-159-0180",
    "PSI-159-0181",
]

SUMMARIES = [
    {
        "investigation_id": "PSI-69",
        "text": "Example only. 17 FLEX droplet tests ran near the lunar-habitat atmosphere and none ended in extinction.",
        "cites": ["PSI-69-0024"],
        "model": "example",
        "generated_at": "2026-11-14T00:00:00+00:00",
        "prompt_version": "example",
        "verified": False,
    },
    {
        "investigation_id": "PSI-159",
        "text": "Example only. CFI-G burned ethane, propane and butane flames up to 85 % O2.",
        "cites": ["PSI-159-0180"],
        "model": "example",
        "generated_at": "2026-11-14T00:00:00+00:00",
        "prompt_version": "example",
        "verified": False,
    },
    {
        "investigation_id": "PSI-98",
        "text": None,
        "cites": [],
        "model": None,
        "generated_at": None,
        "prompt_version": None,
        "verified": False,
    },
]

IMPLICATIONS = [
    {
        "id": "suppression-01",
        "pillar": "suppression",
        "statement": "Example only. 17 FLEX tests at 30-34 % O2 and 0.71-0.72 bar; none ended in extinction.",
        "evidence": ["PSI-69-0024"],
        "scenario_ids": ["lunar_habitat"],
        "verified": False,
    },
    {
        "id": "prevention-01",
        "pillar": "prevention",
        "statement": "Example only. BASS and BASS-II solid tests stop at 22.2 % O2.",
        "evidence": ["PSI-25"],
        "scenario_ids": ["lunar_habitat", "exploration_atm"],
        "verified": False,
    },
    {
        "id": "detection-01",
        "pillar": "detection",
        "statement": "Example only. SAME-R detector results are in the cited documents, not in the table.",
        "evidence": ["PSI-101"],
        "scenario_ids": [],
        "verified": False,
    },
]


def search_docs(investigations, observations):
    docs = []
    for inv in investigations:
        docs.append(
            {
                "id": f"investigation:{inv['id']}",
                "type": "investigation",
                "title": f"{inv['short_name']} - {inv['name']}",
                "text": inv["objective"],
                "investigation_id": inv["id"],
            }
        )
    for obs in observations[:4]:
        docs.append(
            {
                "id": f"observation:{obs['id']}",
                "type": "observation",
                "title": obs["id"],
                "text": f"{obs['fuel']} at {obs['o2_pct']} % O2, {obs['pressure_bar']} bar: {obs['outcome']}",
                "investigation_id": obs["investigation_id"],
            }
        )
    for s in SUMMARIES[:2]:
        docs.append(
            {
                "id": f"summary:{s['investigation_id']}",
                "type": "summary",
                "title": f"Summary {s['investigation_id']}",
                "text": s["text"],
                "investigation_id": s["investigation_id"],
            }
        )
    docs.append(
        {
            "id": f"implication:{IMPLICATIONS[0]['id']}",
            "type": "implication",
            "title": "Suppression",
            "text": IMPLICATIONS[0]["statement"],
            "investigation_id": None,
        }
    )
    return docs


def example_model():
    spec = json.loads((MODELS_DIR / "flex_extinction.json").read_text(encoding="utf-8"))
    spec["fixtures"] = spec["fixtures"][:2] + spec["fixtures"][-1:]
    return spec


def main():
    built = build_all()
    investigations = [
        i for i in built["investigations.json"]["items"] if i["id"] in EXAMPLE_INVESTIGATIONS
    ]
    obs_by_id = {o["id"]: o for o in built["observations.json"]["items"]}
    observations = [obs_by_id[i] for i in EXAMPLE_OBSERVATIONS]
    files = {
        "investigations.json": wrap(investigations),
        "observations.json": wrap(observations),
        "scenarios.json": built["scenarios.json"],
        "summaries.json": wrap(SUMMARIES),
        "implications.json": wrap(IMPLICATIONS),
        "search-docs.json": wrap(search_docs(investigations, observations)),
        "models/flex_extinction.json": example_model(),
    }
    for name, payload in files.items():
        path = EXAMPLES_DIR / name
        write_json(path, payload)
        validate_file(path)
        print(f"wrote contract/examples/{name}")


if __name__ == "__main__":
    main()
