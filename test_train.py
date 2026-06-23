from src.preprocessing import load_data, preprocess_data
from src.feature_engineering import prepare_features
from src.train import (
    generate_predictions,
    prepare_training_data,
    scale_features,
    train_model,
)


def test_training_pipeline_runs():
    telemetry, machines = load_data(
        "data/PdM_telemetry.csv",
        "data/PdM_machines.csv",
    )

    master_df = preprocess_data(telemetry, machines)
    feature_df = prepare_features(master_df)
    X = prepare_training_data(feature_df)

    assert "datetime" not in X.columns
    assert X.select_dtypes(include=["number", "bool"]).shape[1] == X.shape[1]

    X_scaled, scaler = scale_features(X)
    model = train_model(X_scaled)
    result_df = generate_predictions(model, X_scaled, feature_df)

    assert "anomaly_score" in result_df.columns
    assert "anomaly_label" in result_df.columns
    assert set(result_df["anomaly_label"].unique()).issubset({-1, 1})

    print(result_df["anomaly_label"].value_counts())


if __name__ == "__main__":
    test_training_pipeline_runs()
