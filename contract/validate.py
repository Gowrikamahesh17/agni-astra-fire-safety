import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

CONTRACT_DIR = Path(__file__).resolve().parent
EXAMPLES_DIR = CONTRACT_DIR / "examples"

SCHEMAS = {
    "investigations.json": "investigation.schema.json",
    "observations.json": "observation.schema.json",
    "scenarios.json": "scenario.schema.json",
    "summaries.json": "summary.schema.json",
    "implications.json": "implication.schema.json",
    "search-docs.json": "search-doc.schema.json",
}


def schema_name(path):
    if path.parent.name == "models":
        return "model.schema.json"
    return SCHEMAS[path.name]


def validate(path):
    schema = json.loads((CONTRACT_DIR / schema_name(path)).read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    data = json.loads(path.read_text(encoding="utf-8"))
    return [f"{list(e.path)}: {e.message}" for e in Draft202012Validator(schema).iter_errors(data)]


def main(paths):
    targets = [Path(p) for p in paths] or sorted(EXAMPLES_DIR.rglob("*.json"))
    failed = False
    for path in targets:
        errors = validate(path)
        status = "ok" if not errors else f"{len(errors)} errors"
        print(f"{path.name}: {status}")
        for error in errors[:10]:
            print(f"  {error}")
        failed = failed or bool(errors)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
