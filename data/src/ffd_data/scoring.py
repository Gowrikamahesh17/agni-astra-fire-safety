import math

from ffd_data.scenarios import preset_scenarios

O2_UNIT = 5.0
PRESSURE_UNIT = 0.10
NEAR = 1.0
FAR = 3.0

ROLE_RELEVANCE = {
    ("prevention", "solid"): 100,
    ("suppression", None): 90,
    ("detection", None): 90,
    ("flame_behavior", None): 70,
}

OUTCOME_INVESTIGATIONS = {"PSI-69", "PSI-159"}


def distance(o2_pct, pressure_bar, scenario):
    if o2_pct is None or pressure_bar is None:
        return None
    return math.sqrt(
        ((o2_pct - scenario["o2_pct"]) / O2_UNIT) ** 2
        + ((pressure_bar - scenario["pressure_bar"]) / PRESSURE_UNIT) ** 2
    )


def add_distances(observations):
    scenarios = preset_scenarios()
    for obs in observations:
        obs["distance"] = {}
        for s in scenarios:
            d = distance(obs["o2_pct"], obs["pressure_bar"], s)
            obs["distance"][s["id"]] = None if d is None else round(d, 4)


def scenario_components(observations):
    components = {}
    for s in preset_scenarios():
        ds = [
            o["distance"][s["id"]] for o in observations if o["distance"].get(s["id"]) is not None
        ]
        if not ds:
            components[s["id"]] = {"proximity": None, "n_near": 0, "d_min": None}
            continue
        d_min = min(ds)
        components[s["id"]] = {
            "proximity": round(100 * max(0.0, 1 - d_min / FAR)),
            "n_near": sum(d <= NEAR for d in ds),
            "d_min": round(d_min, 4),
        }
    return components


def fire_safety_relevance(investigation):
    role = investigation["fire_safety_role"][0]
    phase = investigation["fuel_phase"]
    return ROLE_RELEVANCE.get((role, phase), ROLE_RELEVANCE.get((role, None)))


def data_usability(investigation, observations):
    if not investigation["has_table"]:
        return 20
    score = 0
    if investigation["id"] in OUTCOME_INVESTIGATIONS:
        score += 40
    if any(o["o2_pct"] is not None and o["pressure_bar"] is not None for o in observations):
        score += 30
    if len(observations) >= 100:
        score += 20
    if observations and all(o["source"]["file"] and o["source"]["row"] for o in observations):
        score += 10
    return score


def static_scores(investigation, observations):
    return {
        "fire_safety_relevance": fire_safety_relevance(investigation),
        "data_usability": data_usability(investigation, observations),
    }
