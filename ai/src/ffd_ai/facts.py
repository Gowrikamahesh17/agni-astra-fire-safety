from collections import Counter, defaultdict

from ffd_ai.verify_numbers import allowed_numbers

MAX_EVIDENCE = 12
NEAR = 1.0

TAKEAWAYS = {
    "SUP-1": "In an atmosphere close to the planned lunar habitat, droplet flames did not go out by themselves, so a fire there should not be expected to self-extinguish and needs active suppression.",
    "SUP-2": "Lowering oxygen strongly favours extinction of droplet flames.",
    "SUP-3": "At the same oxygen level, CO2 or helium dilution went with more extinctions, which supports diluent gases as suppressants; other test conditions were not held fixed.",
    "PRE-1": "Some gas-leak flames in a lunar-habitat-like atmosphere kept burning until the test ended, so leaks still need to be stopped quickly.",
    "PRE-2": "Solid-material flammability at habitat oxygen levels is a data gap in the loaded tables.",
    "PRE-3": "Large-scale burn results are in the Saffire documents and should be read alongside the loaded tables.",
    "DET-1": "The table shows which spacecraft materials were used to make smoke; detector performance must be read from the SAME-R documents.",
    "DET-2": "Smoke detectors in spacecraft must handle real smoke particle sizes and background dust that can cause false alarms; the measured results are in the documents.",
}


def fmt(x, digits=2):
    s = f"{x:.{digits}f}".rstrip("0").rstrip(".")
    return s or "0"


def by_investigation(observations):
    out = defaultdict(list)
    for o in observations:
        out[o["investigation_id"]].append(o)
    return out


def counts_text(counter):
    return ", ".join(f"{k.replace('_', ' ')} {v}" for k, v in counter.most_common())


def _range_line(rows, field, label, unit):
    vals = [r for r in rows if r[field] is not None]
    if not vals:
        return None
    lo = min(vals, key=lambda r: r[field])
    hi = max(vals, key=lambda r: r[field])
    return (
        f"{label} ranged from {fmt(lo[field])} to {fmt(hi[field])} {unit} across {len(vals)} tests.",
        [lo["id"], hi["id"]],
    )


def _label(inv):
    return inv["short_name"] or inv["name"] or inv["id"]


def investigation_facts(inv, rows, scenarios):
    iid = inv["id"]
    lines = [
        (f"{_label(inv)} ({inv['name']}) is NASA investigation {iid}.", [iid]),
        (f"Objective: {inv['objective']}", [iid]),
    ]
    if inv["hardware"]:
        lines.append((f"Hardware: {inv['hardware']}.", [iid]))
    if inv["sensors"]:
        lines.append((f"Sensors: {', '.join(inv['sensors'])}.", [iid]))
    if inv["measured_variables"]:
        lines.append((f"Measured: {', '.join(inv['measured_variables'])}.", [iid]))
    if not rows:
        lines.append(
            (
                "No test table is loaded for this investigation; the evidence is its published description.",
                [iid],
            )
        )
    else:
        lines.append((f"The loaded table has {len(rows)} test rows.", [iid]))
        flame_types = sorted({r["flame_type"] for r in rows if r["flame_type"]})
        if flame_types:
            # CFI-G: in normal flames O2 is the chamber atmosphere; in inverse flames it is the
            # oxidizer stream from the burner and the chamber holds fuel. Never mix the two.
            o2_labels = {
                "normal": "Oxygen in the chamber atmosphere of normal flames",
                "inverse": "Oxygen in the burner stream of inverse flames",
            }
            for ft in flame_types:
                line = _range_line([r for r in rows if r["flame_type"] == ft], "o2_pct", o2_labels[ft], "%")
                if line:
                    lines.append(line)
            line = _range_line(rows, "pressure_bar", "Pressure", "bar")
            if line:
                lines.append(line)
        else:
            for field, label, unit in (("o2_pct", "Oxygen", "%"), ("pressure_bar", "Pressure", "bar")):
                line = _range_line(rows, field, label, unit)
                if line:
                    lines.append(line)
        fuels = Counter(r["material"] or r["fuel"] for r in rows if r["material"] or r["fuel"])
        if fuels:
            lines.append((f"Fuels or materials by number of tests: {counts_text(fuels)}.", [iid]))
        if flame_types:
            for ft in flame_types:
                outcomes = Counter(
                    r["outcome"] for r in rows if r["flame_type"] == ft and r["outcome"]
                )
                lines.append((f"Outcomes of {ft} flames: {counts_text(outcomes)}.", [iid]))
        else:
            outcomes = Counter(r["outcome"] for r in rows if r["outcome"])
            if outcomes:
                lines.append((f"Test outcomes: {counts_text(outcomes)}.", [iid]))
            else:
                lines.append(("The table records no flame-out outcome column.", [iid]))
        for s in scenarios:
            if s["id"] == "custom":
                continue
            # Inverse-flame rows are left out: their O2 is not the chamber atmosphere.
            near = [
                r
                for r in rows
                if r["flame_type"] != "inverse"
                and (r["distance"].get(s["id"]) is not None and r["distance"][s["id"]] <= NEAR)
            ]
            if near:
                what = "normal-flame tests" if flame_types else "tests"
                lines.append(
                    (
                        f"{len(near)} {what} ran close to the {s['name']} atmosphere "
                        f"({fmt(s['o2_pct'])} % O2, {fmt(s['pressure_bar'], 3)} bar).",
                        [r["id"] for r in near[:3]],
                    )
                )
    return pack(lines, extra_texts=[inv["name"] or "", inv["short_name"] or ""])


def pack(lines, extra_texts=()):
    cite_ids = {c for _, cites in lines for c in cites}
    texts = [t for t, _ in lines] + list(extra_texts)
    return {"lines": lines, "cite_ids": cite_ids, "numbers": allowed_numbers(texts)}


def facts_prompt(facts):
    return "\n".join(f"- {text} [{', '.join(cites)}]" for text, cites in facts["lines"])


def _evidence(iid, rows):
    return [iid] + [r["id"] for r in rows[: MAX_EVIDENCE - 1]]


def _rate(rows):
    return sum(r["outcome"] == "extinguished" for r in rows), len(rows)


def _pct(k, n):
    return round(100 * k / n) if n else 0


def implication_facts(investigations, observations, scenarios):
    inv = {i["id"]: i for i in investigations}
    sc = {s["id"]: s for s in scenarios}
    rows = by_investigation(observations)
    flex, cfig = rows["PSI-69"], rows["PSI-159"]
    lunar = sc["lunar_habitat"]
    out = []

    near = [
        r
        for r in flex
        if r["distance"]["lunar_habitat"] is not None and r["distance"]["lunar_habitat"] <= NEAR
    ]
    oc = Counter(r["outcome"] for r in near)
    o2 = [r["o2_pct"] for r in near]
    p = [r["pressure_bar"] for r in near]
    out.append(
        {
            "id": "SUP-1",
            "pillar": "suppression",
            "facts": [
                f"{len(near)} FLEX droplet tests ran at {fmt(min(o2))} to {fmt(max(o2))} % O2 and {fmt(min(p))} to {fmt(max(p))} bar.",
                f"The planned lunar habitat atmosphere is {fmt(lunar['o2_pct'])} % O2 at {fmt(lunar['pressure_bar'], 3)} bar.",
                f"Outcomes of those {len(near)} tests: extinguished {oc['extinguished']}, disrupted {oc['disrupted']}, burned to completion {oc['burned_to_completion']}.",
                "In these tests the flame did not go out on its own before the droplet was used up or broke apart.",
            ],
            "evidence": ["PSI-69"] + [r["id"] for r in near],
            "scenario_ids": ["lunar_habitat", "exploration_atm"],
        }
    )

    low = [r for r in flex if r["o2_pct"] <= 15]
    high = [r for r in flex if r["o2_pct"] > 25]
    lk, ln = _rate(low)
    hk, hn = _rate(high)
    out.append(
        {
            "id": "SUP-2",
            "pillar": "suppression",
            "facts": [
                f"At 15 % O2 or less, {lk} of {ln} FLEX droplet flames were extinguished.",
                f"Above 25 % O2, {hk} of {hn} FLEX droplet flames were extinguished.",
                "Lowering oxygen is the strongest single driver of droplet flame extinction in FLEX.",
            ],
            "evidence": _evidence("PSI-69", low[:6] + high[:5]),
            "scenario_ids": [
                "iss",
                "lunar_habitat",
                "exploration_atm",
                "mars_transit",
                "pressurized_rover",
                "spacesuit",
            ],
        }
    )

    band = [r for r in flex if 15 < r["o2_pct"] <= 21]
    co2 = [r for r in band if r["co2_pct"] > 0]
    he = [r for r in band if r["he_pct"] > 0]
    plain = [r for r in band if r["co2_pct"] == 0 and r["he_pct"] == 0]
    ck, cn = _rate(co2)
    hk2, hn2 = _rate(he)
    pk, pn = _rate(plain)
    out.append(
        {
            "id": "SUP-3",
            "pillar": "suppression",
            "facts": [
                f"FLEX tested CO2 dilution in {sum(r['co2_pct'] > 0 for r in flex)} tests and helium dilution in {sum(r['he_pct'] > 0 for r in flex)} tests.",
                f"Between 15 and 21 % O2, flames were extinguished in {ck} of {cn} CO2-diluted tests ({_pct(ck, cn)} %), {hk2} of {hn2} helium-diluted tests ({_pct(hk2, hn2)} %) and {pk} of {pn} tests without a diluent ({_pct(pk, pn)} %).",
                "The flex_extinction baseline model, which adjusts for oxygen and pressure, also gives CO2 and helium a positive effect on extinction.",
            ],
            "evidence": _evidence("PSI-69", co2[:4] + he[:4] + plain[:3]),
            "scenario_ids": [
                "iss",
                "lunar_habitat",
                "exploration_atm",
                "mars_transit",
                "pressurized_rover",
            ],
        }
    )

    # Only normal flames have the test O2 in the chamber. In inverse flames the O2 value is the
    # oxidizer stream from the burner and the chamber holds fuel, so those rows are left out.
    normal = [r for r in cfig if r["flame_type"] == "normal"]
    o2c = [r for r in normal if r["o2_pct"] is not None]
    window = [
        r
        for r in normal
        if r["o2_pct"] is not None
        and r["pressure_bar"] is not None
        and r["o2_pct"] >= lunar["o2_pct"]
        and r["pressure_bar"] <= lunar["pressure_bar"]
    ]
    inverse_excluded = [
        r
        for r in cfig
        if r["flame_type"] == "inverse"
        and r["o2_pct"] is not None
        and r["pressure_bar"] is not None
        and r["o2_pct"] >= lunar["o2_pct"]
        and r["pressure_bar"] <= lunar["pressure_bar"]
    ]
    wc = Counter(r["outcome"] for r in window)
    top = max(o2c, key=lambda r: r["o2_pct"])
    out.append(
        {
            "id": "PRE-1",
            "pillar": "prevention",
            "facts": [
                f"CFI-G normal flames burned gaseous fuel, like a small gas leak, in atmospheres of up to {fmt(top['o2_pct'])} % O2.",
                f"{len(window)} CFI-G normal-flame tests ran at {fmt(lunar['o2_pct'])} % O2 or more and {fmt(lunar['pressure_bar'], 3)} bar or less, the lunar habitat window.",
                f"{len(inverse_excluded)} CFI-G inverse-flame tests are left out because their oxygen value describes the burner stream, not the chamber.",
                f"Of those {len(window)} tests: still burning when the test ended {wc['sustained_until_stopped']}, self-extinguished {wc['self_extinguished']}, did not ignite {wc['no_ignition']}.",
                "A test ends when the fuel flow is cut, a time limit is reached or the burner gets too hot, so a flame still burning at the end could have burned longer.",
            ],
            "evidence": ["PSI-159", top["id"]] + [r["id"] for r in window[: MAX_EVIDENCE - 2]],
            "scenario_ids": ["lunar_habitat", "exploration_atm"],
        }
    )

    bass2 = [r for r in rows["PSI-25"] if r["o2_pct"] is not None]
    b2top = max(bass2, key=lambda r: r["o2_pct"])
    expl = sc["exploration_atm"]
    out.append(
        {
            "id": "PRE-2",
            "pillar": "prevention",
            "facts": [
                f"The highest oxygen level in the BASS-II solid-material tests is {fmt(b2top['o2_pct'])} % O2.",
                "The BASS table has no oxygen column.",
                f"The lunar habitat plan is {fmt(lunar['o2_pct'])} % O2 and the exploration atmosphere is {fmt(expl['o2_pct'])} % O2.",
                "So the loaded PSI tables have no solid-material flammability tests at habitat oxygen levels, a data gap.",
            ],
            "evidence": ["PSI-25", "PSI-26", b2top["id"]],
            "scenario_ids": ["lunar_habitat", "exploration_atm", "spacesuit"],
        }
    )

    saffire = [inv[i] for i in ("PSI-98", "PSI-99", "PSI-100") if i in inv]
    if saffire:
        out.append(
            {
                "id": "PRE-3",
                "pillar": "prevention",
                "facts": [
                    "Saffire I, II and III burned large material samples inside uncrewed Cygnus vehicles after they left the ISS.",
                    f"Saffire I objective: {saffire[0]['objective']}",
                    "Their results are in the published Saffire documents, not in the loaded tables.",
                ],
                "evidence": [i["id"] for i in saffire],
                "scenario_ids": ["iss", "mars_transit"],
            }
        )

    samer = rows["PSI-101"]
    mats = Counter(r["material"] for r in samer if r["material"])
    out.append(
        {
            "id": "DET-1",
            "pillar": "detection",
            "facts": [
                f"SAME-R ran {len(samer)} smoke tests on spacecraft materials: {counts_text(mats)}.",
                "The table lists material, flow and aging settings; detector results are in the cited SAME-R documents, not in the table.",
            ],
            "evidence": _evidence("PSI-101", samer),
            "scenario_ids": ["iss", "lunar_habitat", "mars_transit", "pressurized_rover"],
        }
    )

    det = [inv[i] for i in ("PSI-102", "DAFT") if i in inv]
    if det:
        out.append(
            {
                "id": "DET-2",
                "pillar": "detection",
                "facts": [f"{_label(i)} objective: {i['objective']}" for i in det]
                + ["These results are described in documents only; no test table is loaded."],
                "evidence": [i["id"] for i in det],
                "scenario_ids": ["iss", "mars_transit"],
            }
        )

    for item in out:
        item["takeaway"] = TAKEAWAYS[item["id"]]
        item["numbers"] = allowed_numbers(item["facts"] + [item["takeaway"]])
    return out
