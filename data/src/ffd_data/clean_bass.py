from ffd_data.load import read_table
from ffd_data.normalize import clean_text, parse_geometry, parse_material, to_float
from ffd_data.observation import new_observation

INVESTIGATION_ID = "PSI-26"


def clean_bass():
    df = read_table("bass")
    file = df.attrs["file"]
    observations = []
    for index, r in enumerate(df.to_dict("records"), start=1):
        obs = new_observation(INVESTIGATION_ID, index, file, r["_row"])
        material_raw = clean_text(r["Fuel Sample Material"])
        geometry = parse_geometry(material_raw)
        material = parse_material(material_raw)
        inferred = material is None and geometry["shape"] == "sphere"
        if inferred:
            material = "PMMA"
        obs.update(
            fuel=material,
            fuel_raw=material_raw,
            material=material,
            geometry=geometry,
            measurements={
                "material_inferred": inferred,
                "test_date": clean_text(r["Date"]),
                "gmt_day": to_float(r["GMT"]),
                "as_run_test": clean_text(r["As Run Test #"]),
                "test": clean_text(r["Test #"]),
                "sample": clean_text(r["Sample #"]),
            },
        )
        observations.append(obs)
    return observations
