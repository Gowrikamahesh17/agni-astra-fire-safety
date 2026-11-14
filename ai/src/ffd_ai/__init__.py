import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AI_DIR = ROOT / "ai"
PROMPTS_DIR = AI_DIR / "prompts"
CONTRACT_DIR = ROOT / "contract"
DATA_DIR = ROOT / "web" / "public" / "data"

CONTRACT_VERSION = "2.0"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
