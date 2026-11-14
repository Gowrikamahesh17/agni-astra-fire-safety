import pandas as pd

from ffd_data.clean_cfig import clean_cfig
from ml.export_model import train_and_export

NUMERIC = ["o2_pct", "pressure_bar", "fuel_fraction_pct"]
CATEGORICAL = ["fuel", "flame_type"]


def cfig_frame():
    rows = []
    for obs in clean_cfig():
        if obs["ignited"] is not True:
            continue
        rows.append(
            {
                "o2_pct": obs["o2_pct"],
                "pressure_bar": obs["pressure_bar"],
                "fuel_fraction_pct": obs["fuel_fraction_pct"],
                "fuel": obs["fuel"],
                "flame_type": obs["flame_type"],
                "self_extinguished": int(obs["outcome"] == "self_extinguished"),
            }
        )
    return pd.DataFrame(rows)


def train_cfig():
    return train_and_export(
        "cfig_self_extinction",
        cfig_frame(),
        target="self_extinguished",
        positive_label="self_extinguished",
        numeric=NUMERIC,
        categorical=CATEGORICAL,
        task="classification",
    )


if __name__ == "__main__":
    print(train_cfig()["metrics"])
