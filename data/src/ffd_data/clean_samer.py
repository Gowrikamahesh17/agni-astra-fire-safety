import re

from ffd_data.load import read_table
from ffd_data.normalize import clean_cat, clean_text, to_float
from ffd_data.observation import new_observation

INVESTIGATION_ID = "PSI-101"

RUN_TYPES = [
    (r"no flow", "no_flow_aging"),
    (r"high rt", "high_rt_r0"),
    (r"low flow", "low_flow"),
    (r"high ?t|htemp|high temp", "high_temp_aging"),
    (r"mid temp", "mid_temp_aging"),
    (r"low temp", "low_temp_aging"),
    (r"b\.?l\.?|baseline", "baseline"),
    (r"aged|aging|ageing", "aged"),
]


def normalize_description(raw):
    text = clean_cat(raw) or ""
    text = re.sub(r"w/\s*", "w/ ", text)
    text = text.replace("ageing", "aging")
    return text or None


def run_type(description):
    text = description or ""
    for pattern, label in RUN_TYPES:
        if re.search(pattern, text):
            return label
    return None


def clean_samer():
    df = read_table("samer")
    file = df.attrs["file"]
    observations = []
    for index, r in enumerate(df.to_dict("records"), start=1):
        obs = new_observation(INVESTIGATION_ID, index, file, r["_row"])
        velocity = to_float(r["Inlet velocity (cm/s)"])
        description = normalize_description(r["Description"])
        obs.update(
            fuel=clean_cat(r["Sample Type"]),
            fuel_raw=clean_text(r["Sample Type"]),
            material=clean_text(r["Sample Type"]),
            flow={"value": velocity, "unit": "cm/s", "kind": "velocity"}
            if velocity is not None
            else None,
            measurements={
                "test": clean_text(r["SAME Test #"]),
                "test_date": clean_text(r["Date"]),
                "description": description,
                "description_raw": clean_text(r["Description"]),
                "run_type": run_type(description),
                "heater_rt_r0": to_float(r["Rt/R0"]),
                "duration_s": to_float(r["Duration (sec)"]),
                "primary_aging_s": to_float(r["Primary aging time (sec)"]),
                "primary_mixing_s": to_float(r["Primary mixing time (sec)"]),
                "net_aging_s": to_float(r["Net aging time (sec)"]),
            },
        )
        observations.append(obs)
    return observations
