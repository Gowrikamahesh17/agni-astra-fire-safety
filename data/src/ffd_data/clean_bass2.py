from ffd_data.load import read_table
from ffd_data.normalize import clean_text, parse_geometry, parse_material, to_float
from ffd_data.observation import new_observation

INVESTIGATION_ID = "PSI-25"

PMMA_SHAPES = {"rod", "film", "slab", "sphere"}


def clean_bass2():
    df = read_table("bass2")
    file = df.attrs["file"]
    observations = []
    for index, r in enumerate(df.to_dict("records"), start=1):
        obs = new_observation(INVESTIGATION_ID, index, file, r["_row"])
        material_raw = clean_text(r["Fuel Sample Material"])
        restrictor = to_float(r["Flow restrictor"])
        geometry = parse_geometry(material_raw)
        material = parse_material(material_raw)
        inferred = material is None and geometry["shape"] in PMMA_SHAPES
        if inferred:
            material = "PMMA"
        obs.update(
            fuel=material,
            fuel_raw=material_raw,
            material=material,
            geometry=geometry,
            o2_pct=to_float(r["Calibrated initial O2 % by vol"]),
            co2_pct=to_float(r["Initial CO2 % by vol"]),
            flow={"value": restrictor, "unit": "setting", "kind": "device_setting"}
            if restrictor is not None
            else None,
            measurements={
                "material_inferred": inferred,
                "pi": clean_text(r["PI"]),
                "test": clean_text(r["Test #"]),
                "test_date": clean_text(r["Date"]),
                "sample": clean_text(r["Sample #"]),
                "flow_restrictor_setting": restrictor,
                "fan_display_raw": clean_text(r["Fan display"]),
                "air_display_raw": clean_text(r["Air display"]),
                "radiometer_gain_raw": clean_text(r["Radiometer gain (1000 250 50 10)"]),
                "total_frames": to_float(r["Total Frames Shot"]),
                "total_frames_raw": clean_text(r["Total Frames Shot"]),
                "o2_final_pct": to_float(r["Calibrated final O2 % by vol"]),
                "co2_final_pct": to_float(r["Final CO2 % by vol"]),
                "co_initial_ppm": to_float(r["Initial CO (ppm)"]),
                "co_final_ppm": to_float(r["Final CO (ppm)"]),
                "co_final_raw": clean_text(r["Final CO (ppm)"]),
            },
        )
        observations.append(obs)
    return observations
