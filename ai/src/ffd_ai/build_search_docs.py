from ffd_ai.facts import by_investigation, fmt, investigation_facts
from ffd_ai.io import load_inputs, read_items, write_items

NAME = "search-docs.json"
SKIP_MEASUREMENTS = {
    "description_raw",
    "fan_display_raw",
    "air_display_raw",
    "total_frames_raw",
    "co_final_raw",
}


def _label(inv):
    return inv["short_name"] or inv["name"] or inv["id"]


def investigation_doc(inv, rows, scenarios):
    facts = investigation_facts(inv, rows, scenarios)
    parts = [text for text, _ in facts["lines"][1:]]
    if inv["program"]:
        parts.append(f"Program: {inv['program']}.")
    parts.append(
        f"Fire-safety role: {', '.join(r.replace('_', ' ') for r in inv['fire_safety_role'])}."
    )
    if inv["fuel_phase"]:
        parts.append(f"Fuel phase: {inv['fuel_phase']}.")
    if inv["doi"]:
        parts.append(f"DOI {inv['doi']}.")
    return {
        "id": inv["id"],
        "type": "investigation",
        "title": f"{_label(inv)}: {inv['name']} ({inv['id']})",
        "text": " ".join(parts),
        "investigation_id": inv["id"],
    }


def observation_doc(o, inv, scenarios=()):
    g = o["geometry"]
    what = o["material"] or o["fuel"] or "sample"
    shape = g["raw"] or g["shape"]
    head = [f"{_label(inv)} test", what]
    if o["flame_type"]:
        head.append(f"{o['flame_type']} flame")
    if o["o2_pct"] is not None:
        head.append(f"{fmt(o['o2_pct'])} % O2")
    if o["pressure_bar"] is not None:
        head.append(f"{fmt(o['pressure_bar'])} bar")
    if o["outcome"]:
        head.append(o["outcome"].replace("_", " "))
    parts = [
        f"Fuel or material: {what}." if what else None,
        f"Geometry: {shape}." if shape else None,
    ]
    for field, label in (
        ("co2_pct", "CO2"),
        ("he_pct", "Helium"),
        ("n2_pct", "N2"),
        ("fuel_fraction_pct", "Fuel fraction"),
    ):
        if o[field]:
            parts.append(f"{label} {fmt(o[field])} %.")
    if o["flow"] and o["flow"]["value"] is not None:
        parts.append(f"Flow {fmt(o['flow']['value'])} {o['flow']['unit']}.")
    if o["outcome"]:
        parts.append(
            f"Outcome: {o['outcome'].replace('_', ' ')}{' (stopped while still burning)' if o['censored'] else ''}."
        )
    for k, v in o["measurements"].items():
        if v is None or v == "" or k in SKIP_MEASUREMENTS:
            continue
        parts.append(f"{k.replace('_', ' ')}: {fmt(v, 3) if isinstance(v, float) else v}.")
    near = [
        s["name"]
        for s in scenarios
        if s["id"] != "custom"
        and o["distance"].get(s["id"]) is not None
        and o["distance"][s["id"]] <= 1
    ]
    if near:
        parts.append(f"Close to the {', '.join(near)} atmosphere.")
    parts.append(f"Source: {o['source']['file']}, row {o['source']['row']}.")
    return {
        "id": o["id"],
        "type": "observation",
        "title": ", ".join(head),
        "text": " ".join(p for p in parts if p),
        "investigation_id": o["investigation_id"],
    }


def build():
    investigations, observations, scenarios = load_inputs()
    inv = {i["id"]: i for i in investigations}
    rows = by_investigation(observations)
    docs = [investigation_doc(i, rows.get(i["id"], []), scenarios) for i in investigations]
    for s in read_items("summaries.json", default=[]):
        if s["verified"] and s["text"]:
            docs.append(
                {
                    "id": f"{s['investigation_id']}-summary",
                    "type": "summary",
                    "title": f"Summary of {_label(inv[s['investigation_id']])}",
                    "text": s["text"],
                    "investigation_id": s["investigation_id"],
                }
            )
    for m in read_items("implications.json", default=[]):
        if m["verified"] and m["statement"]:
            first = next((e for e in m["evidence"] if e in inv), None)
            docs.append(
                {
                    "id": m["id"],
                    "type": "implication",
                    "title": f"{m['pillar'].capitalize()} implication {m['id']}",
                    "text": m["statement"],
                    "investigation_id": first,
                }
            )
    docs.extend(observation_doc(o, inv[o["investigation_id"]], scenarios) for o in observations)
    path = write_items(NAME, docs)
    print(f"{len(docs)} search docs written to {path}")
    return docs


def main():
    build()


if __name__ == "__main__":
    main()
