import argparse
import json
import time

import httpx

from ffd_ai import AI_DIR
from ffd_ai.io import read_items


def run(url):
    questions = json.loads((AI_DIR / "tests" / "chat_questions.json").read_text(encoding="utf-8"))
    known = {d["id"] for d in read_items("search-docs.json")}
    failures = 0
    for q in questions:
        res = httpx.post(
            url, json={"messages": [{"role": "user", "content": q["question"]}]}, timeout=60
        )
        if res.status_code != 200:
            print(f"ERROR {res.status_code}  {q['question']}")
            failures += 1
            continue
        reply = res.json()
        ids = [s["id"] for s in reply["sources"]]
        fake = [i for i in ids if i not in known]
        if q["answerable"]:
            ok = not reply["refused"] and ids and not fake
        else:
            ok = reply["refused"]
        failures += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {q['question']}")
        print(f"      {reply['answer'][:300]}")
        if ids:
            print(f"      sources: {', '.join(ids)}{'  FAKE: ' + ', '.join(fake) if fake else ''}")
        time.sleep(20)
    print(f"\n{len(questions) - failures}/{len(questions)} passed")
    return failures


def main():
    parser = argparse.ArgumentParser(description="Ask the running chat route the 15 test questions")
    parser.add_argument("--url", default="http://localhost:3000/api/chat")
    raise SystemExit(1 if run(parser.parse_args().url) else 0)


if __name__ == "__main__":
    main()
