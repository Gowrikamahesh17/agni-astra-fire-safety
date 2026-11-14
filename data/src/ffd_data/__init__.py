from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2]
REPO_DIR = DATA_DIR.parent
RAW_DIR = DATA_DIR / "raw" / "psi"
CONTRACT_DIR = REPO_DIR / "contract"
OUT_DIR = REPO_DIR / "web" / "public" / "data"
MODELS_DIR = OUT_DIR / "models"

CONTRACT_VERSION = "2.0"
SCORE_FORMULA_VERSION = "2.0"
