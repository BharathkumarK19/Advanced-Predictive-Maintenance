import os
import joblib
from pathlib import Path

import pandas as pd

from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest


def prepare_training_data(df):
    """
    Prepare feature matrix for model training.
    """

    # Remove identifier and timestamp columns, then keep model-ready dtypes.
    X = df.drop(
        columns=["machineID", "datetime"],
        errors="ignore",
    )

    X = X.select_dtypes(
        include=["number", "bool"]
    )

    return X


def scale_features(X):
    """
    Scale features using StandardScaler.
    """

    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    return X_scaled, scaler


def train_model(
    X_scaled,
    contamination,
    n_estimators,
    random_state
):
    """
    Train Isolation Forest.
    """

    model = IsolationForest(
        contamination=contamination,
        n_estimators=n_estimators,
        random_state=random_state
    )

    model.fit(X_scaled)

    return model


def generate_predictions(
    model,
    X_scaled,
    feature_df
):
    """
    Generate anomaly scores and labels.
    """

    result_df = feature_df.copy()

    result_df["anomaly_score"] = (
        model.decision_function(X_scaled)
    )

    result_df["anomaly_label"] = (
        model.predict(X_scaled)
    )

    return result_df


def save_artifacts(
    model,
    scaler,
    feature_columns,
    save_dir="models"
):
    """
    Save model artifacts.
    """

    save_path = Path(save_dir)
    save_path.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        model,
        save_path / "isolation_forest.pkl"
    )

    joblib.dump(
        scaler,
        save_path / "scaler.pkl"
    )

    joblib.dump(
        feature_columns,
        save_path / "features.pkl"
    )

    print("\nArtifacts Saved Successfully")


if __name__ == "__main__":

    from src.preprocessing import (
        load_data,
        preprocess_data
    )

    from src.feature_engineering import (
        prepare_features
    )

    print("Loading Data...")

    telemetry, machines, errors = load_data(
        "data/PdM_telemetry.csv",
        "data/PdM_machines.csv"
    )

    master_df = preprocess_data(
        telemetry,
        machines,
        errors
    )

    print("Creating Features...")

    feature_df = prepare_features(
        master_df
    )

    print("Preparing Training Data...")

    X = prepare_training_data(
        feature_df
    )

    feature_columns = X.columns.tolist()

    print(f"Training Features: {len(feature_columns)}")

    print("Scaling Features...")

    X_scaled, scaler = scale_features(
        X
    )

    print("Training Isolation Forest...")

    model = train_model(
        X_scaled,
        contamination=0.03,
        n_estimators=100,
        random_state=42
    )

    print("Generating Predictions...")

    feature_df = generate_predictions(
        model,
        X_scaled,
        feature_df
    )

    print("\nAnomaly Summary")

    print(
        feature_df["anomaly_label"]
        .value_counts()
    )

    save_artifacts(
        model,
        scaler,
        feature_columns
    )

    print("\nTraining Pipeline Complete")
