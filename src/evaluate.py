from pathlib import Path

import joblib
import numpy as np
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "raw"
MODEL_DIR = PROJECT_ROOT / "models"


def _resolve_path(path: str | Path) -> Path:
    candidate = Path(path)
    if candidate.is_file():
        return candidate

    repo_candidate = PROJECT_ROOT / candidate
    if repo_candidate.is_file():
        return repo_candidate

    raw_candidate = DATA_DIR / candidate.name
    if raw_candidate.is_file():
        return raw_candidate

    raise FileNotFoundError(f"Could not find file: {path}")


def load_artifacts(model_dir: str | Path = MODEL_DIR):
    model_dir = Path(model_dir)

    model = joblib.load(model_dir / "isolation_forest.pkl")
    scaler = joblib.load(model_dir / "scaler.pkl")
    feature_columns = joblib.load(model_dir / "features.pkl")

    return model, scaler, feature_columns


def calculate_detection_metrics(
    predictions_df,
    failures_df,
    alert_window_hours=24
):
    """
    Calculate alert detection metrics.
    """

    anomalies = predictions_df[
        predictions_df["anomaly_label"] == -1
    ].copy()

    total_failures = len(failures_df)

    alerts_before_failure = 0

    lead_times = []

    for _, failure in failures_df.iterrows():

        machine_id = failure["machineID"]

        failure_time = failure["datetime"]

        machine_alerts = anomalies[
            (anomalies["machineID"] == machine_id)
            &
            (
                anomalies["datetime"]
                >= failure_time
                - pd.Timedelta(
                    hours=alert_window_hours
                )
            )
            &
            (
                anomalies["datetime"]
                < failure_time
            )
        ]

        if len(machine_alerts) > 0:

            alerts_before_failure += 1

            latest_alert = (
                machine_alerts["datetime"]
                .max()
            )

            lead_time = (
                failure_time
                -
                latest_alert
            ).total_seconds() / 3600

            lead_times.append(
                lead_time
            )

    detection_rate = (
        alerts_before_failure / total_failures * 100
        if total_failures
        else 0
    )

    avg_lead_time = (
        np.mean(lead_times)
        if lead_times
        else 0
    )

    return {
        "total_failures":
            total_failures,

        "detected_failures":
            alerts_before_failure,

        "detection_rate":
            round(detection_rate, 2),

        "average_lead_time":
            round(avg_lead_time, 2)
    }


def component_detection_rate(
    predictions_df,
    failures_df,
    alert_window_hours=24
):
    """
    Detection rate by component.
    """

    anomalies = predictions_df[
        predictions_df["anomaly_label"] == -1
    ]

    results = []

    for comp in failures_df[
        "failure"
    ].unique():

        subset = failures_df[
            failures_df["failure"] == comp
        ]

        total = len(subset)

        detected = 0

        for _, failure in subset.iterrows():

            machine_id = failure["machineID"]

            failure_time = failure["datetime"]

            alerts = anomalies[
                (anomalies["machineID"] == machine_id)
                &
                (
                    anomalies["datetime"]
                    >= failure_time
                    - pd.Timedelta(
                        hours=alert_window_hours
                    )
                )
                &
                (
                    anomalies["datetime"]
                    < failure_time
                )
            ]

            if len(alerts) > 0:
                detected += 1

        results.append(
            {
                "component": comp,
                "total_failures": total,
                "detected": detected,
                "detection_rate":
                    round(detected / total * 100, 2) if total else 0.0
            }
        )

    return pd.DataFrame(
        results
    )


if __name__ == "__main__":
    try:
        from src.preprocessing import (
            load_data,
            preprocess_data
        )
        from src.feature_engineering import (
            prepare_features
        )
        from src.train import (
            prepare_training_data,
            generate_predictions
        )
    except ModuleNotFoundError:
        from preprocessing import (
            load_data,
            preprocess_data
        )
        from feature_engineering import (
            prepare_features
        )
        from train import (
            prepare_training_data,
            generate_predictions
        )

    print("Loading Data...")

    telemetry, machines = load_data(
        "data/PdM_telemetry.csv",
        "data/PdM_machines.csv"
    )

    failures = pd.read_csv(
        _resolve_path("data/PdM_failures.csv")
    )

    failures["datetime"] = pd.to_datetime(
        failures["datetime"]
    )

    master_df = preprocess_data(
        telemetry,
        machines
    )

    feature_df = prepare_features(
        master_df
    )

    X = prepare_training_data(
        feature_df
    )

    model, scaler, feature_columns = load_artifacts()

    X = X.reindex(
        columns=feature_columns,
        fill_value=0
    )

    X_scaled = scaler.transform(
        X
    )

    feature_df = generate_predictions(
        model,
        X_scaled,
        feature_df
    )

    metrics = calculate_detection_metrics(
        feature_df,
        failures
    )

    print("\nDetection Metrics")

    for key, value in metrics.items():

        print(
            f"{key}: {value}"
        )

    print(
        "\nComponent Detection Rates"
    )

    component_results = (
        component_detection_rate(
            feature_df,
            failures
        )
    )

    print(component_results)
