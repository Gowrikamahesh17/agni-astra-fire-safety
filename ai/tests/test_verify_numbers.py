import pytest

from ffd_ai.verify_numbers import (
    check_statement,
    check_summary,
    numbers,
    split_cites,
    unknown_numbers,
)


@pytest.mark.parametrize(
    "text, expected",
    [
        ("34% O2 at 0.70 bar", [34.0, 0.70]),
        ("34.0 % and 0.7 bar", [34.0, 0.7]),
        ("1,000 tests", [1000.0]),
        ("PSI-69 and CO2 and PSI-69-0012", []),
        ("30-34 % O2", [30.0, 34.0]),
        ("ended [PSI-69-0001, PSI-69]", []),
    ],
)
def test_numbers(text, expected):
    assert numbers(text) == pytest.approx(expected)


def test_tolerance():
    assert unknown_numbers("0.70 bar and 34.0 %", {0.7, 34}) == []
    assert unknown_numbers("0.71 bar", {0.7}) == [0.71]
    assert unknown_numbers("0 tests", {0}) == []


def test_split_cites():
    text, cites = split_cites("It burned [PSI-69]. It stopped [PSI-69-0001, PSI-69].")
    assert text == "It burned. It stopped."
    assert cites == ["PSI-69", "PSI-69-0001"]


FACTS = {"cite_ids": {"PSI-69", "PSI-69-0001"}, "numbers": {274.0, 12.0, 34.0}}


def test_summary_passes():
    raw = "FLEX ran 274 droplet tests [PSI-69]. Oxygen ranged from 12 to 34 % [PSI-69-0001]."
    _, _, problems = check_summary(raw, FACTS)
    assert problems == []


@pytest.mark.parametrize(
    "raw, problem",
    [
        ("FLEX ran 275 tests [PSI-69]. It used oxygen [PSI-69].", "numbers not in the facts"),
        ("FLEX ran 274 tests [PSI-70]. It used oxygen [PSI-69].", "unknown citation ids"),
        ("FLEX ran 274 tests. It used oxygen [PSI-69].", "sentence without a citation"),
    ],
)
def test_summary_rejects(raw, problem):
    _, _, problems = check_summary(raw, FACTS)
    assert any(problem in p for p in problems)


def test_statement():
    assert check_statement("274 tests show it.", FACTS) == []
    assert check_statement("275 tests show it.", FACTS)
    assert check_statement("274 tests [PSI-69].", FACTS)
