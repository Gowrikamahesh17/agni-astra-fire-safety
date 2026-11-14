from ffd_data.normalize import empty_geometry, source


def new_observation(investigation_id, index, file, row):
    return {
        "id": f"{investigation_id}-{index:04d}",
        "investigation_id": investigation_id,
        "flame_type": None,
        "fuel": None,
        "fuel_raw": None,
        "fuel_fraction_pct": None,
        "material": None,
        "geometry": empty_geometry(),
        "o2_pct": None,
        "pressure_bar": None,
        "co2_pct": None,
        "he_pct": None,
        "n2_pct": None,
        "flow": None,
        "gravity": "micro",
        "ignited": None,
        "outcome": None,
        "outcome_raw": None,
        "censored": False,
        "measurements": {},
        "distance": {},
        "source": source(file, row),
    }
