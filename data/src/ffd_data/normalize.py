import math
import re

MMHG_TO_BAR = 0.00133322
PSI_TO_BAR = 0.0689476
INCH_TO_MM = 25.4

MISSING = {"", "-", "none", "n/a", "na", "or", "over", "#div/0!", "#value!", "�"}


def to_float(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return None if math.isnan(value) else float(value)
    text = str(value).strip()
    if text.lower() in MISSING:
        return None
    text = text.lstrip("~")
    try:
        return float(text)
    except ValueError:
        return None


def clean_text(value):
    if value is None:
        return None
    text = re.sub(r"\s+", " ", str(value)).strip()
    return text or None


def clean_cat(value):
    text = clean_text(value)
    return text.lower() if text else None


def rounded(value, digits=4):
    return None if value is None else round(value, digits)


def mmhg_to_bar(value):
    return None if value is None else value * MMHG_TO_BAR


def psi_to_bar(value):
    return None if value is None else value * PSI_TO_BAR


def empty_geometry(raw=None):
    return {"shape": None, "diameter_mm": None, "thickness_mm": None, "width_mm": None, "raw": raw}


MATERIALS = [
    (r"\bpmma\b|acrylic", "PMMA"),
    (r"\bsibal\b", "SIBAL"),
    (r"\bnomex\b", "Nomex"),
    (r"\bultem\b", "Ultem"),
    (r"wax|candle|paraffin|parrafin", "wax"),
]

SHAPES = [
    (r"\brod\b", "rod"),
    (r"spher", "sphere"),
    (r"\bslab\b", "slab"),
    (r"\bfilm\b", "film"),
    (r"\bsheet\b", "sheet"),
    (r"\bnomex\b", "fabric"),
    (r"\bsibal\b", "fabric"),
]


def parse_material(raw):
    text = (raw or "").lower()
    for pattern, name in MATERIALS:
        if re.search(pattern, text):
            return name
    return None


def _length_mm(number, unit):
    value = float(number)
    if unit in ('"', "in", "inch"):
        return value * INCH_TO_MM
    if unit == "cm":
        return value * 10
    if unit == "micron":
        return value / 1000
    return value


def _fraction(text):
    if "/" in text:
        a, b = text.split("/")
        return str(float(a) / float(b))
    return text


def parse_geometry(raw):
    text = clean_text(raw)
    geometry = empty_geometry(text)
    if not text:
        return geometry
    lower = text.lower().replace("2ide", "wide")
    for pattern, shape in SHAPES:
        if re.search(pattern, lower):
            geometry["shape"] = shape
            break

    rod = re.search(
        r"(\d+(?:\.\d+)?(?:/\d+)?)\s*(\"|in\b)?\s*(?:clear|black|blac)?\s*(?:pmma\s*)?rod", lower
    )
    if geometry["shape"] == "rod" and rod:
        geometry["diameter_mm"] = rounded(_length_mm(_fraction(rod.group(1)), '"'), 3)
        return geometry

    thickness = re.search(r"(\d+(?:\.\d+)?)\s*(micron|mm)\s*(?:thick)?", lower)
    if thickness and (thickness.group(2) == "micron" or re.search(r"thick|film|slab", lower)):
        geometry["thickness_mm"] = rounded(_length_mm(thickness.group(1), thickness.group(2)), 3)

    width = re.search(r"(\d+(?:\.\d+)?)\s*cm\s*(?:wide|1 sided|2 sided)?", lower)
    if width:
        mm = _length_mm(width.group(1), "cm")
        if geometry["shape"] == "sphere":
            geometry["diameter_mm"] = rounded(mm, 3)
        else:
            geometry["width_mm"] = rounded(mm, 3)

    if geometry["shape"] is None and geometry["thickness_mm"] is not None:
        geometry["shape"] = "slab" if geometry["thickness_mm"] >= 1 else "film"
    if geometry["shape"] == "film" and geometry["thickness_mm"] and geometry["thickness_mm"] >= 1:
        geometry["shape"] = "slab"
    return geometry


def flow(value, unit, kind):
    return {"value": value, "unit": unit, "kind": kind}


def source(file, row):
    return {"file": file, "row": int(row)}
