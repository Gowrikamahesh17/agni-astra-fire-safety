import pytest

from ffd_ai import DATA_DIR
from ffd_ai.generate_implications import all_facts as implication_facts
from ffd_ai.generate_summaries import all_facts as summary_facts
from ffd_ai.io import load_inputs, read_items
from ffd_ai.review import implication_problems, summary_problems

TOL = 0.01


def published(name):
    if not (DATA_DIR / name).exists():
        pytest.skip(f"{name} not generated yet")
    return read_items(name)


def test_verified_summaries_pass_checks():
    facts = summary_facts()
    for s in published("summaries.json"):
        if s["verified"]:
            assert summary_problems(s, facts, TOL) == [], s["investigation_id"]


def test_verified_implications_pass_checks():
    facts = implication_facts()
    for m in published("implications.json"):
        if m["verified"]:
            assert implication_problems(m, facts, TOL) == [], m["id"]


def test_search_docs_cover_data():
    docs = published("search-docs.json")
    investigations, observations, _ = load_inputs()
    ids = {d["id"] for d in docs}
    assert len(ids) == len(docs)
    assert {i["id"] for i in investigations} <= ids
    assert {o["id"] for o in observations} <= ids


def test_search_docs_only_verified_ai_text():
    docs = {d["id"] for d in published("search-docs.json")}
    for s in read_items("summaries.json", default=[]):
        assert (f"{s['investigation_id']}-summary" in docs) == s["verified"]
    for m in read_items("implications.json", default=[]):
        assert (m["id"] in docs) == m["verified"]
