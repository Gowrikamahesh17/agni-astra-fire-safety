import json

from jsonschema import Draft202012Validator

from ffd_ai import CONTRACT_DIR, CONTRACT_VERSION, DATA_DIR

SCHEMAS = {
    "summaries.json": "summary.schema.json",
    "implications.json": "implication.schema.json",
    "search-docs.json": "search-doc.schema.json",
}


def read_items(name, default=None):
    path = DATA_DIR / name
    if not path.exists() and default is not None:
        return default
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("contract_version") != CONTRACT_VERSION:
        raise ValueError(f"{name}: expected contract_version {CONTRACT_VERSION}")
    return payload["items"]


def validate(name, payload):
    schema = json.loads((CONTRACT_DIR / SCHEMAS[name]).read_text(encoding="utf-8"))
    Draft202012Validator(schema).validate(payload)


def write_items(name, items):
    payload = {"contract_version": CONTRACT_VERSION, "items": items}
    validate(name, payload)
    path = DATA_DIR / name
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
        f.write("\n")
    return path


def load_inputs():
    investigations = read_items("investigations.json")
    observations = read_items("observations.json")
    scenarios = read_items("scenarios.json")
    return investigations, observations, scenarios
