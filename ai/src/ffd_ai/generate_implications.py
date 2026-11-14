import argparse

from ffd_ai import PROMPTS_DIR, groq
from ffd_ai.facts import implication_facts
from ffd_ai.io import load_inputs, read_items, write_items
from ffd_ai.verify_numbers import check_statement, normalize

NAME = "implications.json"


def messages(item):
    system = (PROMPTS_DIR / "implication.md").read_text(encoding="utf-8")
    facts = "\n".join(f"- {f}" for f in item["facts"])
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": f"Pillar: {item['pillar']}\nFacts:\n{facts}"},
    ]


def all_facts():
    return {f["id"]: f for f in implication_facts(*load_inputs())}


def generate(ids=None, force=False):
    cfg = groq.config()
    facts = all_facts()
    existing = {i["id"]: i for i in read_items(NAME, default=[])}
    for fid, item in facts.items():
        if ids and fid not in ids:
            continue
        if fid in existing and not force:
            existing[fid]["evidence"] = item["evidence"]
            existing[fid]["scenario_ids"] = item["scenario_ids"]
            continue
        for attempt in range(1, 4):
            sentence = normalize(groq.chat(messages(item), cfg)).rstrip(".")
            text = f"{sentence}. {item['takeaway']}"
            problems = check_statement(text, item, cfg["tolerance"])
            if not 8 <= len(sentence.split()) <= 60:
                problems.append(f"sentence has {len(sentence.split())} words")
            if not problems:
                break
            print(f"{fid} attempt {attempt} rejected: {'; '.join(problems)}")
        if problems:
            print(f"{fid}: skipped after 3 attempts")
            continue
        existing[fid] = {
            "id": fid,
            "pillar": item["pillar"],
            "statement": text,
            "evidence": item["evidence"],
            "scenario_ids": item["scenario_ids"],
            "verified": False,
        }
        print(f"{fid}: {text}")
    items = [existing[i] for i in facts if i in existing]
    write_items(NAME, items)
    print(f"\n{len(items)} implications written. Review them with: python -m ffd_ai.review")


def main():
    parser = argparse.ArgumentParser(description="Generate fire-safety implications with Groq")
    parser.add_argument("ids", nargs="*")
    parser.add_argument("--force", action="store_true", help="regenerate existing statements")
    args = parser.parse_args()
    generate(set(args.ids), args.force)


if __name__ == "__main__":
    main()
