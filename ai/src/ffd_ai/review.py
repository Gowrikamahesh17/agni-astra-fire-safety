import argparse

from ffd_ai import groq
from ffd_ai.build_search_docs import build
from ffd_ai.generate_implications import all_facts as implication_facts
from ffd_ai.generate_summaries import all_facts as summary_facts
from ffd_ai.io import read_items, write_items
from ffd_ai.verify_numbers import check_statement, unknown_numbers


def summary_problems(s, facts, tol):
    f = facts.get(s["investigation_id"])
    if f is None:
        return ["unknown investigation"]
    problems = []
    bad = unknown_numbers(s["text"] or "", f["numbers"], tol)
    if bad:
        problems.append(f"numbers not in the facts: {bad}")
    unknown = [c for c in s["cites"] if c not in f["cite_ids"]]
    if unknown:
        problems.append(f"unknown citation ids: {unknown}")
    return problems


def implication_problems(m, facts, tol):
    f = facts.get(m["id"])
    return (
        ["unknown implication id"] if f is None else check_statement(m["statement"] or "", f, tol)
    )


def show():
    tol = groq.config()["tolerance"]
    sf, imf = summary_facts(), implication_facts()
    for s in read_items("summaries.json", default=[]):
        p = summary_problems(s, sf, tol)
        mark = "verified" if s["verified"] else "pending"
        print(
            f"[{mark}] {s['investigation_id']}  {'CHECK FAILED: ' + '; '.join(p) if p else 'numbers ok'}"
        )
        print(f"    {s['text']}\n    cites: {', '.join(s['cites'])}\n")
    for m in read_items("implications.json", default=[]):
        p = implication_problems(m, imf, tol)
        mark = "verified" if m["verified"] else "pending"
        print(
            f"[{mark}] {m['id']} ({m['pillar']})  {'CHECK FAILED: ' + '; '.join(p) if p else 'numbers ok'}"
        )
        print(f"    {m['statement']}")
        print("    facts: " + " | ".join(imf[m["id"]]["facts"]) + "\n" if m["id"] in imf else "")


def set_verified(ids, value):
    tol = groq.config()["tolerance"]
    sf, imf = summary_facts(), implication_facts()
    ids = set(ids)
    summaries = read_items("summaries.json", default=[])
    implications = read_items("implications.json", default=[])
    changed = set()
    for s in summaries:
        if s["investigation_id"] in ids or "all" in ids:
            if value and summary_problems(s, sf, tol):
                print(f"{s['investigation_id']}: not approved, number check fails")
                continue
            s["verified"] = value
            changed.add(s["investigation_id"])
    for m in implications:
        if m["id"] in ids or "all" in ids:
            if value and implication_problems(m, imf, tol):
                print(f"{m['id']}: not approved, number check fails")
                continue
            m["verified"] = value
            changed.add(m["id"])
    write_items("summaries.json", summaries)
    write_items("implications.json", implications)
    print(f"{'Approved' if value else 'Unapproved'}: {', '.join(sorted(changed)) or 'nothing'}")
    build()


def main():
    parser = argparse.ArgumentParser(description="Review AI text before it appears on the site")
    sub = parser.add_subparsers(dest="cmd")
    sub.add_parser("show")
    a = sub.add_parser("approve")
    a.add_argument("ids", nargs="+", help="investigation or implication ids, or 'all'")
    r = sub.add_parser("reject")
    r.add_argument("ids", nargs="+")
    args = parser.parse_args()
    if args.cmd == "approve":
        set_verified(args.ids, True)
    elif args.cmd == "reject":
        set_verified(args.ids, False)
    else:
        show()


if __name__ == "__main__":
    main()
