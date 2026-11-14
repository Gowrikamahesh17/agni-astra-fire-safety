import json

import pytest

from ffd_data import MODELS_DIR
from ml.export_model import predict

LEAKY = {"extinction_d_mm", "burning_rate_mm2_s", "burn_time_s", "peak_burner_t_c", "o2_after_pct"}


def load(name):
    return json.loads((MODELS_DIR / f"{name}.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("name", ["flex_extinction", "cfig_self_extinction", "flex_burning_rate"])
def test_fixtures_reproduce(name):
    spec = load(name)
    assert len(spec["fixtures"]) >= 15
    for fixture in spec["fixtures"]:
        result = predict(spec, fixture["input"])
        assert result["value"] == pytest.approx(fixture["expected"]["value"], abs=1e-9)
        assert result["out_of_range"] == fixture["expected"]["out_of_range"]


@pytest.mark.parametrize("name", ["flex_extinction", "cfig_self_extinction"])
def test_no_post_test_features(name):
    assert not LEAKY & set(load(name)["features"])


def test_classifiers_beat_baseline():
    for name in ("flex_extinction", "cfig_self_extinction"):
        m = load(name)["metrics"]
        assert m["balanced_accuracy"] > m["baseline_balanced_accuracy"]
        assert m["roc_auc"] > 0.6


def test_flex_trends():
    w = load("flex_extinction")["weights"]
    assert w["o2_pct"] < 0
    assert w["co2_pct"] > 0
    assert w["he_pct"] > 0


def test_out_of_range_flags():
    spec = load("flex_extinction")
    inputs = dict(spec["fixtures"][0]["input"], o2_pct=60.0)
    assert "o2_pct" in predict(spec, inputs)["out_of_range"]
