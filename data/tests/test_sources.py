import csv

from ffd_data import RAW_DIR

KEY_FIELD = {
    "PSI-69": ("FLEX Identifier", "flex_identifier"),
    "PSI-159": ("Test", "test"),
    "PSI-25": ("Test #", "test"),
    "PSI-26": ("As Run Test #", "as_run_test"),
    "PSI-101": ("SAME Test #", "test"),
}


def raw_lines(file):
    with open(RAW_DIR / file, encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        lines = {}
        for row in reader:
            lines[reader.line_num] = row
        return lines


def test_every_source_row_exists_and_matches(observations):
    cache = {}
    for obs in observations:
        file, row = obs["source"]["file"], obs["source"]["row"]
        lines = cache.setdefault(file, raw_lines(file))
        assert row in lines, f"{obs['id']} points to missing row {row}"
        header = [" ".join(h.split()) for h in lines[1]]
        column, key = KEY_FIELD[obs["investigation_id"]]
        raw_value = " ".join(lines[row][header.index(column)].split())
        assert (raw_value or None) == obs["measurements"][key], obs["id"]


def test_source_rows_skip_header(observations):
    assert min(o["source"]["row"] for o in observations) == 2
