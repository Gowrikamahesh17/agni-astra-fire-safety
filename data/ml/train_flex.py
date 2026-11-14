import pandas as pd

from ffd_data.clean_flex import clean_flex
from ml.export_model import train_and_export

NUMERIC = ["pressure_bar", "o2_pct", "co2_pct", "he_pct", "droplet_d0_mm"]
CATEGORICAL = ["fuel"]


def flex_frame():
    rows = []
    for obs in clean_flex():
        m = obs["measurements"]
        if obs["pressure_bar"] is None or m["droplet_d0_mm"] is None:
            continue
        rows.append(
            {
                "fuel": obs["fuel"],
                "pressure_bar": obs["pressure_bar"],
                "o2_pct": obs["o2_pct"],
                "co2_pct": obs["co2_pct"],
                "he_pct": obs["he_pct"],
                "droplet_d0_mm": m["droplet_d0_mm"],
                "extinguished": int(obs["outcome"] == "extinguished"),
                "burning_rate_mm2_s": m["burning_rate_mm2_s"],
            }
        )
    return pd.DataFrame(rows)


def train_flex():
    return train_and_export(
        "flex_extinction",
        flex_frame(),
        target="extinguished",
        positive_label="extinguished",
        numeric=NUMERIC,
        categorical=CATEGORICAL,
        task="classification",
    )


def train_flex_burning_rate():
    df = flex_frame().dropna(subset=["burning_rate_mm2_s"])
    return train_and_export(
        "flex_burning_rate",
        df,
        target="burning_rate_mm2_s",
        positive_label=None,
        numeric=NUMERIC,
        categorical=CATEGORICAL,
        task="regression",
    )


if __name__ == "__main__":
    print(train_flex()["metrics"])
    print(train_flex_burning_rate()["metrics"])
