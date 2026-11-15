from collections import Counter

LUNAR_O2 = 30.0
LUNAR_P = 0.7033


def outcome_counts(rows, **match):
    return Counter(r["outcome_raw"] for r in rows if all(r[k] == v for k, v in match.items()))


def test_row_counts(by_investigation):
    sizes = {k: len(v) for k, v in by_investigation.items()}
    assert sizes == {"PSI-69": 274, "PSI-159": 333, "PSI-25": 129, "PSI-26": 122, "PSI-101": 109}


def test_flex_outcomes(by_investigation):
    flex = by_investigation["PSI-69"]
    assert Counter(r["outcome"] for r in flex) == {
        "extinguished": 186,
        "disrupted": 61,
        "burned_to_completion": 27,
    }
    assert Counter(r["fuel"] for r in flex) == {"methanol": 157, "heptane": 117}


def test_flex_composition(by_investigation):
    flex = by_investigation["PSI-69"]
    assert sum(r["co2_pct"] > 0 for r in flex) == 123
    assert sum(r["he_pct"] > 0 for r in flex) == 50
    assert sum(r["pressure_bar"] is None for r in flex) == 1
    assert sum(0.70 <= r["pressure_bar"] <= 0.73 for r in flex if r["pressure_bar"]) == 103


def test_cfig_outcomes(by_investigation):
    cfig = by_investigation["PSI-159"]
    assert outcome_counts(cfig, flame_type="normal") == {"SE": 102, "FT": 31, "-": 46}
    assert outcome_counts(cfig, flame_type="inverse") == {"SE": 81, "FT": 58, "-": 15}
    for r in cfig:
        assert r["censored"] == (r["outcome"] == "sustained_until_stopped")
        assert r["ignited"] == (r["outcome"] != "no_ignition")


def test_strict_moon_window(by_investigation):
    cfig = by_investigation["PSI-159"]
    window = [r for r in cfig if r["o2_pct"] >= LUNAR_O2 and r["pressure_bar"] <= LUNAR_P]
    # The raw count is 48, but in inverse flames the O2 value is the burner oxidizer stream and the
    # chamber holds fuel, so only the 20 normal-flame tests have Moon-range chamber air.
    assert Counter(r["flame_type"] for r in window) == {"normal": 20, "inverse": 28}
    chamber_window = [r for r in window if r["flame_type"] == "normal"]
    assert len(chamber_window) == 20


def test_flex_near_lunar_window(by_investigation, investigations):
    flex = by_investigation["PSI-69"]
    near = [
        r
        for r in flex
        if r["distance"]["lunar_habitat"] is not None and r["distance"]["lunar_habitat"] <= 1
    ]
    assert len(near) == 17
    assert Counter(r["outcome"] for r in near) == {"disrupted": 15, "burned_to_completion": 2}
    assert investigations["PSI-69"]["scenario_components"]["lunar_habitat"]["n_near"] >= 17


def test_flex_low_oxygen_extinction(by_investigation):
    low = [r for r in by_investigation["PSI-69"] if r["o2_pct"] <= 15]
    assert len(low) == 48
    assert sum(r["outcome"] == "extinguished" for r in low) == 45


def test_no_zero_pressure(observations):
    assert all(r["pressure_bar"] is None or r["pressure_bar"] > 0 for r in observations)


def test_unique_ids(observations):
    ids = [r["id"] for r in observations]
    assert len(ids) == len(set(ids))


def test_metadata_only_entries(investigations):
    text_only = [i for i in investigations.values() if not i["has_table"]]
    assert {"PSI-98", "PSI-99", "PSI-100", "PSI-102", "DAFT", "ACME-BRE"} <= {
        i["id"] for i in text_only
    }
    for inv in text_only:
        assert inv["evidence_type"] == "text"
        assert inv["static_scores"]["data_usability"] == 20
        assert all(c["proximity"] is None for c in inv["scenario_components"].values())
