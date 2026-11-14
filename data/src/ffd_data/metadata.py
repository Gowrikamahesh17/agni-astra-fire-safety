from ffd_data.load import FILES

PSI_URL = "https://psi.nasa.gov/physci/repo/data/investigations/{}"
ACME_URL = "https://science.nasa.gov/mission/acme"
LICENSE = "CC0-1.0"


def _psi(psi_id):
    return PSI_URL.format(psi_id)


INVESTIGATIONS = [
    {
        "id": "PSI-69",
        "name": "Flame Extinguishment Experiment",
        "short_name": "FLEX",
        "program": None,
        "fire_safety_role": ["suppression"],
        "fuel_phase": "liquid",
        "objective": (
            "Burns isolated methanol and heptane droplets in microgravity across oxygen, pressure "
            "and diluent (CO2, helium) levels to find when flames go out, informing the choice of "
            "gaseous fire suppressants for spacecraft cabins."
        ),
        "hardware": "CIR / MDCA",
        "sensors": [
            "backlit droplet camera",
            "color flame camera",
            "OH* chemiluminescence camera",
            "radiometers",
        ],
        "measured_variables": [
            "droplet initial diameter",
            "flame extinction diameter",
            "burning rate",
            "burn time",
            "test end (extinction, disruption, completion)",
        ],
        "psi_id": "PSI-69",
        "doi": "10.60555/mbq8-0451",
        "table_files": [FILES["flex"]],
    },
    {
        "id": "PSI-159",
        "name": "Cool Flames Investigation with Gases",
        "short_name": "CFI-G",
        "program": "ACME",
        "fire_safety_role": ["flame_behavior"],
        "fuel_phase": "gas",
        "objective": (
            "Studies normal and inverse spherical gas flames (ethane, propane, butane) from a porous "
            "burner over a wide range of oxygen and pressure, recording ignition, self-extinction "
            "and cool-flame behaviour relevant to gas leaks in oxygen-enriched cabins."
        ),
        "hardware": "CIR / ACME burner",
        "sensors": ["color camera", "photomultiplier tube", "burner thermocouple"],
        "measured_variables": [
            "hot ignition",
            "burn time",
            "self-extinction vs flow termination",
            "peak burner temperature",
            "cool flame presence",
        ],
        "psi_id": "PSI-159",
        "doi": "10.60555/cyt1-kh64",
        "table_files": [FILES["cfig_normal"], FILES["cfig_inverse"]],
    },
    {
        "id": "PSI-25",
        "name": "Burning and Suppression of Solids II",
        "short_name": "BASS-II",
        "program": None,
        "fire_safety_role": ["prevention"],
        "fuel_phase": "solid",
        "objective": (
            "Burns solid materials (PMMA rods, films and slabs, SIBAL cotton-fiberglass, Nomex) in "
            "a small flow duct at reduced oxygen and varying airflow to study flame spread, "
            "flammability limits and extinction of spacecraft materials."
        ),
        "hardware": "MSG",
        "sensors": ["video cameras", "radiometer", "O2 sensor", "CO2 sensor", "CO sensor"],
        "measured_variables": [
            "initial and final O2",
            "initial and final CO2",
            "initial and final CO",
            "flow device settings",
            "video frames",
        ],
        "psi_id": "PSI-25",
        "doi": "10.60555/4qc4-de67",
        "table_files": [FILES["bass2"]],
    },
    {
        "id": "PSI-26",
        "name": "Burning and Suppression of Solids",
        "short_name": "BASS",
        "program": None,
        "fire_safety_role": ["prevention"],
        "fuel_phase": "solid",
        "objective": (
            "Examines how solid materials such as PMMA spheres and slabs, SIBAL fabric, Nomex and "
            "wax candles burn and extinguish in microgravity under different flow conditions."
        ),
        "hardware": "MSG",
        "sensors": ["video cameras", "radiometer"],
        "measured_variables": ["sample material", "sample geometry"],
        "psi_id": "PSI-26",
        "doi": "10.60555/58h4-dy80",
        "table_files": [FILES["bass"]],
    },
    {
        "id": "PSI-101",
        "name": "Smoke Aerosol Measurement Experiment - Reflight",
        "short_name": "SAME-R",
        "program": None,
        "fire_safety_role": ["detection"],
        "fuel_phase": "solid",
        "objective": (
            "Heats spacecraft materials (Kapton, silicone, Teflon, Pyrell, lampwick) to produce "
            "smoke, ages it and measures the particles to guide the design of spacecraft smoke "
            "detectors."
        ),
        "hardware": "MSG",
        "sensors": ["P-Trak particle counter", "spacecraft smoke detectors"],
        "measured_variables": ["inlet velocity", "heater Rt/R0", "duration", "aging time"],
        "psi_id": "PSI-101",
        "doi": "10.60555/2np7-jv14",
        "table_files": [FILES["samer"]],
    },
    {
        "id": "PSI-98",
        "name": "Spacecraft Fire Experiment I",
        "short_name": "Saffire-I",
        "program": "Saffire",
        "fire_safety_role": ["prevention"],
        "fuel_phase": "solid",
        "objective": (
            "Burned a large cotton-fiberglass (SIBAL) sheet, about 0.4 m by 1 m, inside an "
            "uncrewed Cygnus vehicle after it left the ISS, to measure large-scale flame spread "
            "and its effect on cabin atmosphere."
        ),
        "hardware": "Cygnus (Saffire)",
        "sensors": ["video cameras", "O2 sensor", "CO2 sensor", "radiometers", "thermocouples"],
        "measured_variables": ["flame spread", "cabin pressure", "cabin O2 and CO2"],
        "psi_id": "PSI-98",
    },
    {
        "id": "PSI-99",
        "name": "Spacecraft Fire Experiment II",
        "short_name": "Saffire-II",
        "program": "Saffire",
        "fire_safety_role": ["prevention"],
        "fuel_phase": "solid",
        "objective": (
            "Ignited nine 5 cm by 30 cm samples, including cotton-fiberglass, Nomex and PMMA, "
            "inside a Cygnus vehicle to test material flammability at spacecraft scale."
        ),
        "hardware": "Cygnus (Saffire)",
        "sensors": ["video cameras", "O2 sensor", "CO2 sensor", "radiometers", "thermocouples"],
        "measured_variables": ["material flammability", "flame spread", "cabin O2 and CO2"],
        "psi_id": "PSI-99",
    },
    {
        "id": "PSI-100",
        "name": "Spacecraft Fire Experiment III",
        "short_name": "Saffire-III",
        "program": "Saffire",
        "fire_safety_role": ["prevention"],
        "fuel_phase": "solid",
        "objective": (
            "Repeated the large-scale Saffire-I cotton-fiberglass burn inside a Cygnus vehicle "
            "under a different airflow condition."
        ),
        "hardware": "Cygnus (Saffire)",
        "sensors": ["video cameras", "O2 sensor", "CO2 sensor", "radiometers", "thermocouples"],
        "measured_variables": ["flame spread", "cabin pressure", "cabin O2 and CO2"],
        "psi_id": "PSI-100",
    },
    {
        "id": "PSI-102",
        "name": "Smoke Aerosol Measurement Experiment",
        "short_name": "SAME",
        "program": None,
        "fire_safety_role": ["detection"],
        "fuel_phase": "solid",
        "objective": (
            "First ISS flight of the smoke experiment: measured the particle size of smoke from "
            "overheated spacecraft materials to judge how well spacecraft smoke detectors work."
        ),
        "hardware": "MSG",
        "sensors": ["particle counters", "spacecraft smoke detectors"],
        "measured_variables": ["smoke particle size", "particle number concentration"],
        "psi_id": "PSI-102",
    },
    {
        "id": "DAFT",
        "name": "Dust and Aerosol Measurement Feasibility Test",
        "short_name": "DAFT",
        "program": None,
        "fire_safety_role": ["detection"],
        "fuel_phase": None,
        "objective": (
            "Checked on the ISS that a commercial particle counter works in long-duration "
            "microgravity and measured the station's background dust, which can cause false "
            "smoke-detector alarms; a risk-reduction step for SAME."
        ),
        "hardware": "ISS cabin (portable)",
        "sensors": ["P-Trak particle counter", "Dust-Trak", "ionization smoke detector"],
        "measured_variables": ["particle number concentration", "dust mass concentration"],
        "psi_id": None,
        # No PSI listing found; NASA Glenn's Research and Technology 2004 report describes DAFT.
        "source_url": "https://ntrs.nasa.gov/citations/20050215648",
    },
    {
        "id": "ACME-BRE",
        "name": "Burning Rate Emulator",
        "short_name": "BRE",
        "program": "ACME",
        "fire_safety_role": ["flame_behavior", "prevention"],
        "fuel_phase": "gas",
        "objective": (
            "Uses gas flames from a porous burner to emulate burning solids and liquids, to "
            "understand materials flammability, extinction and the conditions needed for "
            "sustained burning."
        ),
        "hardware": "CIR / ACME burner",
        "sensors": ["color camera", "radiometer", "heat flux gauges", "thermocouples"],
        "measured_variables": ["heat flux", "extinction conditions", "burner temperature"],
        "psi_id": None,
        "source_url": ACME_URL,
    },
    {
        "id": "ACME-SFLAME",
        "name": "Structure and Response of Spherical Diffusion Flames",
        "short_name": "s-Flame",
        "program": "ACME",
        "fire_safety_role": ["flame_behavior"],
        "fuel_phase": "gas",
        "objective": (
            "Studies spherical diffusion flames to predict the structure, dynamics and extinction "
            "of soot-free and sooty flames."
        ),
        "hardware": "CIR / ACME burner",
        "sensors": ["color camera", "radiometer", "thermocouples"],
        "measured_variables": ["flame size", "extinction", "radiative emission"],
        "psi_id": None,
        "source_url": ACME_URL,
    },
    {
        "id": "ACME-FLAMEDESIGN",
        "name": "Flame Design",
        "short_name": "Flame Design",
        "program": "ACME",
        "fire_safety_role": ["flame_behavior"],
        "fuel_phase": "gas",
        "objective": (
            "Investigates soot inception and control to design robust, soot-free non-premixed "
            "flames, including oxygen-enriched combustion."
        ),
        "hardware": "CIR / ACME burner",
        "sensors": ["color camera", "radiometer"],
        "measured_variables": ["soot formation", "flame size"],
        "psi_id": None,
        "source_url": ACME_URL,
    },
    {
        "id": "ACME-CLD",
        "name": "Coflow Laminar Diffusion Flame",
        "short_name": "CLD Flame",
        "program": "ACME",
        "fire_safety_role": ["flame_behavior"],
        "fuel_phase": "gas",
        "objective": (
            "Extends the range of flame conditions that models predict accurately by checking "
            "chemical kinetic and soot formation submodels on coflow flames."
        ),
        "hardware": "CIR / ACME burner",
        "sensors": ["color camera", "soot imaging"],
        "measured_variables": ["flame shape", "soot volume fraction"],
        "psi_id": None,
        "source_url": ACME_URL,
    },
    {
        "id": "ACME-EFIELD",
        "name": "Electric-Field Effects on Laminar Diffusion Flames",
        "short_name": "E-FIELD Flames",
        "program": "ACME",
        "fire_safety_role": ["flame_behavior"],
        "fuel_phase": "gas",
        "objective": (
            "Examines how flames produce ions and how applied electric fields can control "
            "non-premixed flames."
        ),
        "hardware": "CIR / ACME burner",
        "sensors": ["color camera", "ion current probe"],
        "measured_variables": ["ion current", "flame shape"],
        "psi_id": None,
        "source_url": ACME_URL,
    },
]


def base_records():
    records = []
    for meta in INVESTIGATIONS:
        record = {
            "doi": None,
            "license": LICENSE,
            "table_files": [],
            **meta,
        }
        if "source_url" not in meta:
            record["source_url"] = _psi(meta["psi_id"]) if meta["psi_id"] else None
        record["has_table"] = bool(record["table_files"])
        record["evidence_type"] = "measured_rows" if record["has_table"] else "text"
        records.append(record)
    return records
