import re

from ffd_data.load import read_table
from ffd_data.normalize import clean_cat, clean_text, rounded, to_float
from ffd_data.observation import new_observation

INVESTIGATION_ID = "PSI-159"

OUTCOMES = {"se": "self_extinguished", "ft": "sustained_until_stopped", "-": "no_ignition"}

HOT_IGNITION = {"yes": "yes", "no": "no", "flash": "flash"}


def split_fuel(raw):
    text = clean_cat(raw) or ""
    match = re.match(r"(\d+(?:\.\d+)?)\s*%\s*(\w+)", text)
    if match:
        return match.group(2), float(match.group(1))
    return (text or None), 100.0


def _pct(value):
    number = to_float(value)
    return None if number is None else rounded(number * 100, 3)


def _row(df, r, index, flame_type):
    file = df.attrs["file"]
    obs = new_observation(INVESTIGATION_ID, index, file, r["_row"])
    normal = flame_type == "normal"
    outcome_raw = clean_text(r["Self-ext or flow term" if normal else "Self -ext or flow term"])
    outcome = OUTCOMES.get((outcome_raw or "").lower())
    if normal:
        fuel, fraction = split_fuel(r["Fuel"])
    else:
        fuel = clean_cat(r["Fuel"])
        fraction = _pct(r["Xf before test"])
    peak_c = to_float(r["Peak burner T (C )" if normal else "Peak burner Temp (C)"])
    measurements = {
        "test": clean_text(r["Test"]),
        "day": to_float(r["Day"]),
        "burn_time_s": to_float(r["burn time (sec)"]),
        "peak_burner_t_c": peak_c,
        "hot_ignition": HOT_IGNITION.get(clean_cat(r["Hot ignition"]) or ""),
        "tfp": clean_cat(r["TFP"]),
        "adiabatic_flame_t_k": to_float(r["Tad (K)"]),
        "stoich_mixture_fraction": to_float(r["Zst"]),
        "comments": clean_text(r["Comments"]),
    }
    if normal:
        measurements.update(
            xf_burner=to_float(r["Xf"]),
            o2_after_pct=_pct(r["XO2 after test"]),
            fuel_flow_mg_s=to_float(r["mHC (mg/s)"]),
            cool_flame=clean_text(r["Cool flame?"]),
        )
    else:
        measurements.update(
            xf_after_pct=_pct(r["Xf after test"]),
            fuel_burn_rate_mg_s=to_float(r["HC burnrate (mg/s)"]),
            o2_flow_mg_s=to_float(r["O2 flow rate (mg/s)"]),
            color=clean_cat(r["Color"]),
        )
    mass_flow = measurements.get("fuel_flow_mg_s") if normal else measurements["o2_flow_mg_s"]
    obs.update(
        flame_type=flame_type,
        fuel=fuel,
        fuel_raw=clean_text(r["Fuel"]),
        fuel_fraction_pct=fraction,
        geometry={
            "shape": "sphere",
            "diameter_mm": None,
            "thickness_mm": None,
            "width_mm": None,
            "raw": "porous spherical burner",
        },
        o2_pct=_pct(r["XO2 before test" if normal else "XO2"]),
        pressure_bar=rounded(to_float(r["approx p (bar)"]), 4),
        flow={
            "value": mass_flow,
            "unit": "mg/s",
            "kind": "mass_flow",
        }
        if mass_flow is not None
        else None,
        ignited=outcome != "no_ignition" if outcome else None,
        outcome=outcome,
        outcome_raw=outcome_raw,
        censored=outcome == "sustained_until_stopped",
        measurements=measurements,
    )
    return obs


def clean_cfig():
    observations = []
    index = 0
    for key, flame_type in (("cfig_normal", "normal"), ("cfig_inverse", "inverse")):
        df = read_table(key)
        for r in df.to_dict("records"):
            index += 1
            observations.append(_row(df, r, index, flame_type))
    return observations
