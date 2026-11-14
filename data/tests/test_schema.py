import json

import pytest

from ffd_data import CONTRACT_DIR, MODELS_DIR, OUT_DIR
from ffd_data.export import write_json
from ffd_data.validate import validate_file


def test_built_files_validate(built, tmp_path):
    for name, payload in built.items():
        path = tmp_path / name
        write_json(path, payload)
        validate_file(path)


@pytest.mark.parametrize("name", ["investigations.json", "observations.json", "scenarios.json"])
def test_published_files_validate(name):
    validate_file(OUT_DIR / name)


def test_published_files_are_current(built):
    for name, payload in built.items():
        published = json.loads((OUT_DIR / name).read_text(encoding="utf-8"))
        assert published == json.loads(json.dumps(payload)), f"{name} is stale, run make data"


def test_model_files_validate():
    paths = sorted(MODELS_DIR.glob("*.json"))
    assert {p.stem for p in paths} >= {"flex_extinction", "cfig_self_extinction"}
    for path in paths:
        validate_file(path)


def test_contract_examples_validate():
    examples = CONTRACT_DIR / "examples"
    paths = sorted(examples.rglob("*.json"))
    assert paths
    for path in paths:
        validate_file(path)
