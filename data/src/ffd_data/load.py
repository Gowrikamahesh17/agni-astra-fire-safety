import csv
import re

import pandas as pd

from ffd_data import RAW_DIR

FILES = {
    "flex": "PSI-69_Experimental table_FLEX.csv",
    "cfig_normal": "PSI-159_Experimental table_CFI-G_Normal Flames.csv",
    "cfig_inverse": "PSI-159_Experimental table_CFI-G_Inverse Flames.csv",
    "bass2": "PSI-25_Experimental table_BASS-II.csv",
    "bass": "PSI-26_Experimental table_BASS.csv",
    "samer": "PSI-101_Experimental table_SAME-R.csv",
}


def normalize_header(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip())


def _read_rows(path):
    for encoding in ("utf-8-sig", "latin1"):
        try:
            with open(path, encoding=encoding, newline="") as f:
                reader = csv.reader(f)
                return [(reader.line_num, row) for row in reader]
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Cannot decode {path}")


def read_table(key: str) -> pd.DataFrame:
    file = FILES[key]
    rows = _read_rows(RAW_DIR / file)
    header = [normalize_header(h) for h in rows[0][1]]
    records = []
    for line, values in rows[1:]:
        if not any(v.strip() for v in values):
            continue
        values = (values + [""] * len(header))[: len(header)]
        record = dict(zip(header, values, strict=True))
        record["_row"] = line
        records.append(record)
    df = pd.DataFrame.from_records(records, columns=header + ["_row"])
    df.attrs["file"] = file
    return df
