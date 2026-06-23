from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]


def _resolve_path(path: str | Path) -> Path:
    candidate = Path(path)
    if candidate.is_file():
        return candidate

    repo_candidate = PROJECT_ROOT / candidate
    if repo_candidate.is_file():
        return repo_candidate

    raw_candidate = PROJECT_ROOT / "data" / "raw" / candidate.name
    if raw_candidate.is_file():
        return raw_candidate

    raise FileNotFoundError(f"Could not find file: {path}")

try:
    from src.config import load_config
    from src.logger import get_logger
    from src.preprocessing import (
        load_data,
        preprocess_data
    )
    from src.feature_engineering import (
        prepare_features
    )
    from src.train import (
        prepare_training_data,
        scale_features,
        train_model,
        generate_predictions,
        save_artifacts
    )
    from src.evaluate import (
        calculate_detection_metrics,
        component_detection_rate
    )
except ModuleNotFoundError:
    from config import load_config
    from logger import get_logger
    from preprocessing import (
        load_data,
        preprocess_data
    )
    from feature_engineering import (
        prepare_features
    )
    from train import (
        prepare_training_data,
        scale_features,
        train_model,
        generate_predictions,
        save_artifacts
    )
    from evaluate import (
        calculate_detection_metrics,
        component_detection_rate
    )


def main():

    logger = get_logger()

    config = load_config(PROJECT_ROOT / "configs" / "config.yaml")

    logger.info(
        "Loading Data"
    )

    telemetry, machines = load_data(
        config["data"]["telemetry_path"],
        config["data"]["machines_path"]
    )

    failures = pd.read_csv(
        _resolve_path(config["data"]["failures_path"])
    )

    failures["datetime"] = pd.to_datetime(
        failures["datetime"]
    )

    logger.info(
        "Preprocessing Data"
    )

    master_df = preprocess_data(
        telemetry,
        machines
    )

    logger.info(
        "Creating Features"
    )

    feature_df = prepare_features(
        master_df
    )

    logger.info(
        "Preparing Training Data"
    )

    X = prepare_training_data(
        feature_df
    )

    X_scaled, scaler = scale_features(
        X
    )

    logger.info(
        "Training Model"
    )

    model = train_model(
        X_scaled,
        contamination=config["model"]["contamination"],
        n_estimators=config["model"]["n_estimators"],
        random_state=config["model"]["random_state"]
    )

    logger.info(
        "Generating Predictions"
    )

    feature_df = generate_predictions(
        model,
        X_scaled,
        feature_df
    )

    logger.info(
        "Evaluating Model"
    )

    metrics = calculate_detection_metrics(
        feature_df,
        failures,
        alert_window_hours=config["evaluation"]["alert_window_hours"]
    )

    print("\nDetection Metrics")

    for k, v in metrics.items():

        print(f"{k}: {v}")

    component_results = (
        component_detection_rate(
            feature_df,
            failures
        )
    )

    print("\nComponent Results")

    print(component_results)

    logger.info(
        f"Detection Rate = {metrics['detection_rate']}"
    )

    logger.info(
        "Saving Artifacts"
    )

    save_artifacts(
        model,
        scaler,
        X.columns.tolist(),
        save_dir=PROJECT_ROOT / "models"
    )

    logger.info(
        "Pipeline Complete"
    )


if __name__ == "__main__":
    main()
