import math
from datetime import UTC, datetime

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier, DummyRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import balanced_accuracy_score, mean_absolute_error, r2_score, roc_auc_score
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ffd_data import CONTRACT_VERSION, MODELS_DIR
from ffd_data.export import write_json
from ffd_data.validate import validate_file

SEED = 42
FOLDS = 5
N_FIXTURES = 20


def make_pipeline(numeric, categorical, task):
    pre = ColumnTransformer(
        [
            ("num", StandardScaler(), numeric),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical),
        ]
    )
    if task == "classification":
        estimator = LogisticRegression(class_weight="balanced", max_iter=5000)
    else:
        estimator = Ridge(alpha=1.0)
    return Pipeline([("pre", pre), ("model", estimator)])


def _metrics(pipeline, X, y, task):
    if task == "classification":
        cv = StratifiedKFold(FOLDS, shuffle=True, random_state=SEED)
        proba = cross_val_predict(pipeline, X, y, cv=cv, method="predict_proba")[:, 1]
        dummy = cross_val_predict(DummyClassifier(strategy="most_frequent"), X, y, cv=cv)
        return {
            "n_rows": len(y),
            "cv_folds": FOLDS,
            "balanced_accuracy": round(balanced_accuracy_score(y, proba >= 0.5), 4),
            "roc_auc": round(roc_auc_score(y, proba), 4),
            "baseline_balanced_accuracy": round(balanced_accuracy_score(y, dummy), 4),
        }
    cv = KFold(FOLDS, shuffle=True, random_state=SEED)
    pred = cross_val_predict(pipeline, X, y, cv=cv)
    dummy = cross_val_predict(DummyRegressor(strategy="mean"), X, y, cv=cv)
    return {
        "n_rows": len(y),
        "cv_folds": FOLDS,
        "r2": round(r2_score(y, pred), 4),
        "mae": round(mean_absolute_error(y, pred), 4),
        "baseline_mae": round(mean_absolute_error(y, dummy), 4),
    }


def _export_params(pipeline, numeric, categorical):
    pre = pipeline.named_steps["pre"]
    model = pipeline.named_steps["model"]
    scaler = pre.named_transformers_["num"]
    encoder = pre.named_transformers_["cat"]
    coef = np.ravel(model.coef_)
    bias = (
        float(np.ravel(model.intercept_)[0])
        if np.ndim(model.intercept_)
        else float(model.intercept_)
    )
    mean, std, weights = {}, {}, {}
    for i, name in enumerate(numeric):
        mean[name] = float(scaler.mean_[i])
        std[name] = float(scaler.scale_[i])
        weights[name] = float(coef[i])
    categories = {}
    offset = len(numeric)
    for feature, levels in zip(categorical, encoder.categories_, strict=True):
        categories[feature] = [str(v) for v in levels]
        for level in levels:
            key = f"{feature}={level}"
            mean[key], std[key], weights[key] = 0.0, 1.0, float(coef[offset])
            offset += 1
    return categories, mean, std, weights, bias


def predict(spec, inputs):
    z = spec["bias"]
    out_of_range = []
    for feature in spec["features"]:
        value = inputs.get(feature)
        if feature in spec["categories"]:
            if value not in spec["categories"][feature]:
                out_of_range.append(feature)
                continue
            key = f"{feature}={value}"
            z += spec["weights"][key]
            continue
        lo, hi = spec["valid_range"][feature]
        if value is None or value < lo or value > hi:
            out_of_range.append(feature)
        if value is None:
            continue
        z += spec["weights"][feature] * (value - spec["mean"][feature]) / spec["std"][feature]
    value = 1 / (1 + math.exp(-z)) if spec["task"] == "classification" else z
    return {"value": value, "out_of_range": out_of_range}


def _fixture_inputs(X, numeric, categorical, valid_range):
    sample = X.sample(n=min(N_FIXTURES - 3, len(X)), random_state=SEED)
    inputs = [
        {k: (float(v) if k in numeric else str(v)) for k, v in row.items()}
        for row in sample.to_dict("records")
    ]
    base = dict(inputs[0])
    high = {**base, numeric[0]: round(valid_range[numeric[0]][1] * 1.5 + 1, 4)}
    low = {**base, numeric[-1]: round(valid_range[numeric[-1]][0] - 1, 4)}
    unknown = {**base, categorical[0]: "unknown"}
    return inputs + [high, low, unknown]


def train_and_export(name, df, target, positive_label, numeric, categorical, task):
    X = df[numeric + categorical].copy()
    y = df[target].to_numpy()
    pipeline = make_pipeline(numeric, categorical, task)
    metrics = _metrics(pipeline, X, y, task)
    pipeline.fit(X, y)
    categories, mean, std, weights, bias = _export_params(pipeline, numeric, categorical)
    valid_range = {f: [float(X[f].min()), float(X[f].max())] for f in numeric}
    spec = {
        "contract_version": CONTRACT_VERSION,
        "name": name,
        "task": task,
        "target": target,
        "positive_label": positive_label,
        "features": numeric + categorical,
        "categories": categories,
        "mean": mean,
        "std": std,
        "weights": weights,
        "bias": bias,
        "valid_range": valid_range,
        "metrics": metrics,
        "fixtures": [],
        "trained_at": datetime.now(UTC).replace(microsecond=0).isoformat(),
    }
    fixtures = []
    for inputs in _fixture_inputs(X, numeric, categorical, valid_range):
        result = predict(spec, inputs)
        frame = pd.DataFrame([inputs])[numeric + categorical]
        if task == "classification":
            reference = pipeline.predict_proba(frame)[0, 1]
        else:
            reference = pipeline.predict(frame)[0]
        unknown_category = any(inputs[c] not in categories[c] for c in categorical)
        if not unknown_category and abs(reference - result["value"]) > 1e-9:
            raise AssertionError(f"{name}: exported weights disagree with scikit-learn")
        fixtures.append(
            {
                "input": inputs,
                "expected": {
                    "value": round(result["value"], 10),
                    "out_of_range": result["out_of_range"],
                },
            }
        )
    spec["fixtures"] = fixtures
    path = MODELS_DIR / f"{name}.json"
    write_json(path, spec)
    validate_file(path)
    return spec


def main():
    from ml.train_cfig import train_cfig
    from ml.train_flex import train_flex, train_flex_burning_rate

    for train in (train_flex, train_cfig, train_flex_burning_rate):
        spec = train()
        m = spec["metrics"]
        print(f"{spec['name']}: {m}")


if __name__ == "__main__":
    main()
