import pytest

from ffd_ai.facts import by_investigation, implication_facts, investigation_facts
from ffd_ai.io import load_inputs


@pytest.fixture(scope="module")
def inputs():
    return load_inputs()


@pytest.fixture(scope="module")
def implications(inputs):
    return {f["id"]: f for f in implication_facts(*inputs)}


def text(item):
    return " ".join(item["facts"])


def test_pillars_and_counts(implications):
    pillars = [f["pillar"] for f in implications.values()]
    for p in ("prevention", "detection", "suppression"):
        assert 2 <= pillars.count(p) <= 4


def test_seed_lunar_near(implications):
    t = text(implications["SUP-1"])
    assert "17 FLEX droplet tests ran at 30 to 34 % O2 and 0.71 to 0.72 bar" in t
    assert "extinguished 0, disrupted 15, burned to completion 2" in t
    assert len(implications["SUP-1"]["evidence"]) == 18


def test_seed_low_oxygen(implications):
    t = text(implications["SUP-2"])
    assert "At 15 % O2 or less, 45 of 48" in t
    assert "Above 25 % O2, 2 of 24" in t


def test_seed_diluents(implications):
    t = text(implications["SUP-3"])
    assert "CO2 dilution in 123 tests and helium dilution in 50 tests" in t
    assert "63 of 75 CO2-diluted tests (84 %)" in t
    assert "26 of 44 tests without a diluent (59 %)" in t


def test_seed_cfig(implications):
    t = text(implications["PRE-1"])
    assert "up to 85 % O2" in t
    assert "48 CFI-G tests" in t


def test_seed_solid_gap(implications):
    assert "22.2 % O2" in text(implications["PRE-2"])


def test_seed_same_r(implications):
    t = text(implications["DET-1"])
    for m in ("Kapton", "Silicone", "Teflon", "Pyrell", "Lampwick"):
        assert m in t


def test_evidence_ids_exist(inputs, implications):
    investigations, observations, scenarios = inputs
    known = {i["id"] for i in investigations} | {o["id"] for o in observations}
    scenario_ids = {s["id"] for s in scenarios}
    for f in implications.values():
        assert f["evidence"]
        assert set(f["evidence"]) <= known
        assert set(f["scenario_ids"]) <= scenario_ids


def test_investigation_facts_cover_all(inputs):
    investigations, observations, scenarios = inputs
    rows = by_investigation(observations)
    for inv in investigations:
        f = investigation_facts(inv, rows.get(inv["id"], []), scenarios)
        assert inv["id"] in f["cite_ids"]
        assert f["lines"]
    flex = investigation_facts(investigations[0], rows["PSI-69"], scenarios)
    assert 274 in flex["numbers"] and 186 in flex["numbers"]


def test_every_scenario_has_an_implication(inputs, implications):
    _, _, scenarios = inputs
    tagged = {s for f in implications.values() for s in f["scenario_ids"]}
    assert {s["id"] for s in scenarios if s["id"] != "custom"} <= tagged
