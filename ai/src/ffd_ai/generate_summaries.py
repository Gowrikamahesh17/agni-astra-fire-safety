import argparse
from datetime import UTC, datetime

from ffd_ai import PROMPTS_DIR, groq
from ffd_ai.facts import by_investigation, facts_prompt, investigation_facts
from ffd_ai.io import load_inputs, read_items, write_items
from ffd_ai.verify_numbers import check_summary, normalize

NAME = "summaries.json"


def messages(facts):
    system = (PROMPTS_DIR / "summary.md").read_text(encoding="utf-8")
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": f"Facts:\n{facts_prompt(facts)}"},
    ]


def all_facts():
    investigations, observations, scenarios = load_inputs()
    rows = by_investigation(observations)
    return {
        i["id"]: investigation_facts(i, rows.get(i["id"], []), scenarios) for i in investigations
    }


def generate(ids=None, force=False):
    cfg = groq.config()
    facts = all_facts()
    existing = {s["investigation_id"]: s for s in read_items(NAME, default=[])}
    for iid, f in facts.items():
        if ids and iid not in ids:
            continue
        if iid in existing and not force:
            continue
        for attempt in range(1, 4):
            raw = normalize(groq.chat(messages(f), cfg))
            text, cites, problems = check_summary(raw, f, cfg["tolerance"])
            if not problems:
                break
            print(f"{iid} attempt {attempt} rejected: {'; '.join(problems)}")
        if problems:
            print(f"{iid}: skipped after 3 attempts")
            continue
        existing[iid] = {
            "investigation_id": iid,
            "text": text,
            "cites": cites,
            "model": cfg["model"],
            "generated_at": datetime.now(UTC).replace(microsecond=0).isoformat(),
            "prompt_version": cfg["prompt_versions"]["summary"],
            "verified": False,
        }
        print(f"{iid}: {text}")
    items = [existing[i] for i in facts if i in existing]
    write_items(NAME, items)
    print(f"\n{len(items)} summaries written. Review them with: python -m ffd_ai.review")


def main():
    parser = argparse.ArgumentParser(description="Generate investigation summaries with Groq")
    parser.add_argument("ids", nargs="*")
    parser.add_argument("--force", action="store_true", help="regenerate existing summaries")
    args = parser.parse_args()
    generate(set(args.ids), args.force)


if __name__ == "__main__":
    main()
