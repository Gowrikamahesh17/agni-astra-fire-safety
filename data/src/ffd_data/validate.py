import json

from jsonschema import Draft202012Validator

from ffd_data import CONTRACT_DIR

SCHEMAS = {
    "investigations.json": "investigation.schema.json",
    "observations.json": "observation.schema.json",
    "scenarios.json": "scenario.schema.json",
    "summaries.json": "summary.schema.json",
    "implications.json": "implication.schema.json",
    "search-docs.json": "search-doc.schema.json",
}


def schema_for(path):
    name = SCHEMAS.get(path.name, "model.schema.json" if path.parent.name == "models" else None)
    if name is None:
        raise ValueError(f"No schema for {path}")
    return json.loads((CONTRACT_DIR / name).read_text(encoding="utf-8"))


def validate_file(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema_for(path))
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if errors:
        details = "\n".join(f"  {list(e.path)}: {e.message}" for e in errors[:10])
        raise ValueError(f"{path} failed {len(errors)} checks:\n{details}")
