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
        component_detection_rate,
        calculate_alert_precision
    )
    from src.mlflow_utils import (
        start_run,
        end_run,
        log_parameters,
        log_metrics,
        log_artifact,
        log_model
    )

except ModuleNotFoundError:
    from config import load_config
    from logger import get_logger
    from preprocessing import (
        load_data,
        preprocess_data
    )
    from mlflow_utils import (
        start_run,
        end_run,
        log_parameters,
        log_metrics,
        log_artifact,
        log_model
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
    split_date = "2015-09-01"
    run = start_run(
        run_name="IsolationForest_v1"
    )
    try:
        log_parameters({
            "contamination": config["model"]["contamination"],
            "n_estimators": config["model"]["n_estimators"],
            "split_date": split_date,
            "alert_window": config["evaluation"]["alert_window_hours"]
        })
        logger.info("Loading Data")

        telemetry, machines, errors = load_data(
            config["data"]["telemetry_path"],
            config["data"]["machines_path"],
            config["data"]["errors_path"]
        )

        failures = pd.read_csv(
            _resolve_path(config["data"]["failures_path"])
        )

        failures["datetime"] = pd.to_datetime(failures["datetime"])

        logger.info("Preprocessing Data")

        master_df = preprocess_data(
            telemetry,
            machines,
            errors
        )
        print("\nError Flag Distribution")
        print(master_df["error_flag"].value_counts())

        logger.info("Creating Features")

        feature_df = prepare_features(master_df)

        train_df = feature_df[
            feature_df["datetime"] < split_date
        ].copy()

        test_df = feature_df[
            feature_df["datetime"] >= split_date
        ].copy()

        print("\nTrain Size:", len(train_df))
        print("Test Size:", len(test_df))

        test_failures = failures[
            failures["datetime"] >= split_date
        ].copy()

        print("Test Failures:", len(test_failures))
        logger.info("Preparing Training Data")

        X_train = prepare_training_data(train_df)

        X_train_scaled, scaler = scale_features(X_train)

        logger.info("Training Model")

        model = train_model(
            X_train_scaled,
            contamination=config["model"]["contamination"],
            n_estimators=config["model"]["n_estimators"],
            random_state=config["model"]["random_state"]
        )

        logger.info("Generating Predictions")
        X_test = prepare_training_data(test_df)
        X_test_scaled = scaler.transform(X_test)
        test_df = generate_predictions(
            model,
            X_test_scaled,
            test_df
        )
        print("\nAlert Distribution")
        print(test_df["anomaly_label"].value_counts())

        logger.info("Evaluating Model")
        metrics = calculate_detection_metrics(
            test_df,
            test_failures,
            alert_window_hours=config["evaluation"]["alert_window_hours"]
        )
        alert_metrics = calculate_alert_precision(
            test_df,
            test_failures
        )

        log_metrics({
            "Detection Rate": metrics["detection_rate"],
            "Lead Time": metrics["average_lead_time"],
            "Total Failures": metrics["total_failures"],
            "Detected Failures": metrics["detected_failures"],
            "Alert Precision": alert_metrics["precision"],
            "Total Alerts": alert_metrics["total_alerts"]
        })

        print("\nDetection Metrics")
        for k, v in metrics.items():
            print(f"{k}: {v}")

        component_results = component_detection_rate(
            test_df,
            test_failures,
        )

        print("\nComponent Results")
        print(component_results)

        print("\nAlert Quality")
        for k, v in alert_metrics.items():
            print(f"{k}: {v}")

        logger.info(
            f"Detection Rate = {metrics['detection_rate']}"
        )

        logger.info("Saving Artifacts")

        save_artifacts(
            model,
            scaler,
            X_train.columns.tolist(),
            save_dir=PROJECT_ROOT / "models"
        )
        log_model(model)
        log_artifact("configs/config.yaml")
        log_artifact("reports/experiments.csv")

        logger.info("Pipeline Complete")
    finally:
        end_run()


if __name__ == "__main__":
    main()
