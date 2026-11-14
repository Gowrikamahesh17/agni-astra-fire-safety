import pytest

from ffd_data.clean_cfig import split_fuel
from ffd_data.clean_samer import normalize_description
from ffd_data.normalize import parse_geometry, parse_material, to_float


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("", None),
        ("-", None),
        ("none", None),
        ("#DIV/0!", None),
        ("~6", 6.0),
        ("�", None),
        ("3.2", 3.2),
    ],
)
def test_to_float(raw, expected):
    assert to_float(raw) == expected


@pytest.mark.parametrize(
    ("raw", "shape", "field", "value"),
    [
        ('1/4" clear rod', "rod", "diameter_mm", 6.35),
        ("2 cm 100 micron thick PMMA", "film", "thickness_mm", 0.1),
        ("2 cm 0.1 mm PMMA film", "film", "width_mm", 20.0),
        ("5 mm thick PMMA 2 cm wide", "slab", "thickness_mm", 5.0),
        ("2 cm 4 mm 1 sided PMMA slab", "slab", "thickness_mm", 4.0),
        ("PMMA sphere 2 cm", "sphere", "diameter_mm", 20.0),
        ("2 cm SIBAL", "fabric", "width_mm", 20.0),
    ],
)
def test_parse_geometry(raw, shape, field, value):
    geometry = parse_geometry(raw)
    assert geometry["shape"] == shape
    assert geometry[field] == pytest.approx(value)
    assert geometry["raw"] == raw


@pytest.mark.parametrize(
    ("raw", "material"),
    [
        ("Nomex natural (nomex III)", "Nomex"),
        ("parrafin wax candle", "wax"),
        ("2 cm SIBAL", "SIBAL"),
    ],
)
def test_parse_material(raw, material):
    assert parse_material(raw) == material


def test_split_fuel():
    assert split_fuel("30% butane") == ("butane", 30.0)
    assert split_fuel("propane") == ("propane", 100.0)


def test_samer_description_variants():
    assert normalize_description("No flow run w/aging") == normalize_description(
        "No flow run w/ aging"
    )
    assert normalize_description("Baseline Aging") == normalize_description("Baseline aging")
