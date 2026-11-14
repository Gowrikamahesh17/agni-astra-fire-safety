import os
import time

import httpx
import yaml
from dotenv import load_dotenv

from ffd_ai import AI_DIR, ROOT

API_URL = "https://api.groq.com/openai/v1"


def config():
    load_dotenv(ROOT / ".env.local")
    load_dotenv(ROOT / "web" / ".env.local")
    cfg = yaml.safe_load((AI_DIR / "config.yaml").read_text(encoding="utf-8"))
    cfg["model"] = os.environ.get("GROQ_MODEL") or cfg["model"]
    return cfg


def _headers():
    config()
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise RuntimeError("GROQ_API_KEY is not set. Add it to .env.local")
    return {"Authorization": f"Bearer {key}"}


def chat(messages, cfg=None):
    cfg = cfg or config()
    body = {
        "model": cfg["model"],
        "messages": messages,
        "temperature": cfg["temperature"],
        "max_tokens": cfg["max_tokens"],
    }
    if cfg["model"].startswith("openai/gpt-oss"):
        body["reasoning_effort"] = cfg["reasoning_effort"]
    for attempt in range(cfg["retries"] + 1):
        res = httpx.post(f"{API_URL}/chat/completions", json=body, headers=_headers(), timeout=60)
        if res.status_code == 429 and attempt < cfg["retries"]:
            time.sleep(float(res.headers.get("retry-after", 5 * (attempt + 1))))
            continue
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"].strip()
    raise RuntimeError("Groq rate limit, try again later")


def list_models():
    res = httpx.get(f"{API_URL}/models", headers=_headers(), timeout=30)
    res.raise_for_status()
    return sorted(m["id"] for m in res.json()["data"])


def main():
    cfg = config()
    print("Models on this key:")
    for name in list_models():
        print(f"  {name}")
    print(f"\nUsing {cfg['model']}")
    print(chat([{"role": "user", "content": "Reply with the single word: ready"}], cfg))


if __name__ == "__main__":
    main()
