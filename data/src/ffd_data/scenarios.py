PARTIAL_GRAVITY_NOTE = "PSI has no partial-gravity combustion data. Results are microgravity only."

SCENARIOS = [
    {
        "id": "iss",
        "name": "ISS cabin",
        "o2_pct": 21.0,
        "pressure_bar": 1.013,
        "gravity": "micro",
        "note": "ISS cabin atmosphere.",
        "assumption": False,
    },
    {
        "id": "lunar_habitat",
        "name": "Lunar habitat",
        "o2_pct": 30.0,
        "pressure_bar": 0.703,
        "gravity": "0.16 g",
        "note": "Challenge brief: at least 30 % O2 at no more than 10.2 psi.",
        "assumption": False,
    },
    {
        "id": "exploration_atm",
        "name": "Exploration atmosphere",
        "o2_pct": 34.0,
        "pressure_bar": 0.565,
        "gravity": "0.16 g",
        "note": (
            "NASA's proposed exploration atmosphere: 8.2 psia (56.5 kPa), 34 % O2, 66 % N2. "
            "Sources: NTRS 20230015594 and NTRS 20220015741."
        ),
        "assumption": False,
    },
    {
        "id": "pressurized_rover",
        "name": "Pressurized rover",
        "o2_pct": 34.0,
        "pressure_bar": 0.565,
        "gravity": "0.16 g",
        "note": "Assumed equal to the exploration atmosphere.",
        "assumption": True,
    },
    {
        "id": "mars_transit",
        "name": "Mars transit vehicle",
        "o2_pct": 21.0,
        "pressure_bar": 1.013,
        "gravity": "micro",
        "note": "Assumed ISS-like cabin.",
        "assumption": True,
    },
    {
        "id": "spacesuit",
        "name": "Spacesuit",
        "o2_pct": 100.0,
        "pressure_bar": 0.296,
        "gravity": "varies",
        "note": "100 % O2 at 4.3 psi.",
        "assumption": False,
    },
    {
        "id": "custom",
        "name": "Custom",
        "o2_pct": None,
        "pressure_bar": None,
        "gravity": None,
        "note": "Set O2 and pressure with the sliders.",
        "assumption": False,
    },
]


def build_scenarios():
    scenarios = []
    for s in SCENARIOS:
        partial = s["gravity"] not in ("micro", None)
        scenarios.append({**s, "gravity_note": PARTIAL_GRAVITY_NOTE if partial else None})
    return scenarios


def preset_scenarios():
    return [s for s in SCENARIOS if s["o2_pct"] is not None and s["pressure_bar"] is not None]
