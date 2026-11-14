import re

ID_LIKE = re.compile(r"[A-Za-z][A-Za-z_]*-?\d+(?:-\d+)*")
NUMBER = re.compile(r"\d+(?:,\d{3})*(?:\.\d+)?")
CITE = re.compile(r"\[([^\]]*)\]")
SENTENCE_END = re.compile(r"(?<=[.!?])\s+(?=[A-Z])")
PUNCTUATION = str.maketrans({"‐": "-", "‑": "-", "‒": "-", "−": "-", " ": " ", " ": " ", " ": " "})


def normalize(text):
    return (text or "").translate(PUNCTUATION).strip().strip('"').strip()


def numbers(text):
    text = CITE.sub(" ", text or "")
    text = ID_LIKE.sub(" ", text)
    return [float(m.replace(",", "")) for m in NUMBER.findall(text)]


def allowed_numbers(texts):
    out = set()
    for t in texts:
        out.update(numbers(t))
    return out


def close(a, b, tolerance):
    if b == 0 or (a.is_integer() and float(b).is_integer()):
        return a == b
    return abs(a - b) <= tolerance * abs(b)


def unknown_numbers(text, allowed, tolerance=0.01):
    return [n for n in numbers(text) if not any(close(n, a, tolerance) for a in allowed)]


def split_cites(raw):
    cites = []
    for group in CITE.findall(raw):
        cites.extend(c.strip() for c in group.split(",") if c.strip())
    text = CITE.sub("", raw)
    text = re.sub(r"\s+([.,;:!?])", r"\1", text)
    return re.sub(r"\s{2,}", " ", text).strip(), list(dict.fromkeys(cites))


def check_summary(raw, facts, tolerance=0.01):
    problems = []
    sentences = [s for s in SENTENCE_END.split(raw.strip()) if s]
    for s in sentences:
        if not CITE.search(s):
            problems.append(f"sentence without a citation: {s[:60]}")
    text, cites = split_cites(raw)
    bad_ids = [c for c in cites if c not in facts["cite_ids"]]
    if bad_ids:
        problems.append(f"unknown citation ids: {bad_ids}")
    if not cites:
        problems.append("no citations")
    bad = unknown_numbers(text, facts["numbers"], tolerance)
    if bad:
        problems.append(f"numbers not in the facts: {bad}")
    if not 1 <= len(sentences) <= 4:
        problems.append(f"expected 2-3 sentences, got {len(sentences)}")
    return text, cites, problems


def check_statement(text, facts, tolerance=0.01):
    problems = []
    if CITE.search(text):
        problems.append("statement contains bracketed citations")
    bad = unknown_numbers(text, facts["numbers"], tolerance)
    if bad:
        problems.append(f"numbers not in the facts: {bad}")
    return problems
