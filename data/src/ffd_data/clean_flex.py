from ffd_data.load import read_table
from ffd_data.normalize import clean_cat, clean_text, mmhg_to_bar, rounded, to_float
from ffd_data.observation import new_observation

INVESTIGATION_ID = "PSI-69"

OUTCOMES = {
    "extinction": "extinguished",
    "disruption": "disrupted",
    "completion": "burned_to_completion",
}


def _pct(value):
    number = to_float(value)
    return None if number is None else rounded(number * 100, 3)


def clean_flex():
    df = read_table("flex")
    file = df.attrs["file"]
    observations = []
    for index, r in enumerate(df.to_dict("records"), start=1):
        obs = new_observation(INVESTIGATION_ID, index, file, r["_row"])
        pressure_mmhg = to_float(r["Ambient pressure; mmHg"])
        if pressure_mmhg == 0:
            pressure_mmhg = None
        outcome_raw = clean_text(r["Test end"])
        obs.update(
            fuel=clean_cat(r["Fuel"]),
            fuel_raw=clean_text(r["Fuel"]),
            fuel_fraction_pct=100.0,
            geometry={
                "shape": "sphere",
                "diameter_mm": to_float(r["Droplet initial diameter; mm"]),
                "thickness_mm": None,
                "width_mm": None,
                "raw": "droplet",
            },
            o2_pct=_pct(r["O initial ambient composition; mole fraction"]),
            pressure_bar=rounded(mmhg_to_bar(pressure_mmhg), 4),
            co2_pct=_pct(r["CO initial ambient composition; mole fraction"]),
            he_pct=_pct(r["He initial ambient composition; mole fraction"]),
            n2_pct=_pct(r["N initial ambient composition; mole fraction"]),
            ignited=True,
            outcome=OUTCOMES.get(clean_cat(outcome_raw)),
            outcome_raw=outcome_raw,
            censored=False,
            measurements={
                "test_number": clean_text(r["FLEX Test #"]),
                "flex_identifier": clean_text(r["FLEX Identifier"]),
                "test_date": clean_text(r["Test Date"]),
                "test_gmt": clean_text(r["Test GMT"]),
                "pressure_mmhg": pressure_mmhg,
                "droplet_d0_mm": to_float(r["Droplet initial diameter; mm"]),
                "extinction_d_mm": to_float(r["Visible flame extinction diameter; mm"]),
                "burning_rate_mm2_s": to_float(r["Burning rate; mm"]),
                "burn_time_s": to_float(r["Burn time; s"]),
                "burn_time_approx": str(r["Burn time; s"]).strip().startswith("~"),
            },
        )
        observations.append(obs)
    return observations
