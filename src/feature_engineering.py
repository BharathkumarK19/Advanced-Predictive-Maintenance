import pandas as pd
import numpy as np


SENSORS = [
    "volt",
    "rotate",
    "pressure",
    "vibration"
]


def create_rolling_features(df, window=24):
    """
    Create rolling mean and rolling std features.
    """

    for col in SENSORS:

        df[f"{col}_mean_{window}h"] = (
            df.groupby("machineID")[col]
            .transform(
                lambda x: x.rolling(
                    window=window,
                    min_periods=1
                ).mean()
            )
        )

        df[f"{col}_std_{window}h"] = (
            df.groupby("machineID")[col]
            .transform(
                lambda x: x.rolling(
                    window=window,
                    min_periods=1
                ).std()
            )
        )

    return df


def create_lag_features(df, lags=[1, 6, 24]):
    """
    Create lag features.
    """

    for col in SENSORS:

        for lag in lags:

            df[f"{col}_lag{lag}"] = (
                df.groupby("machineID")[col]
                .shift(lag)
            )

    return df


def create_change_features(df):
    """
    Create change and percentage change features.
    """

    for col in SENSORS:

        # Absolute Change
        df[f"{col}_change"] = (
            df[col]
            -
            df.groupby("machineID")[col].shift(1)
        )

        # Percentage Change
        df[f"{col}_pct_change"] = (
            df.groupby("machineID")[col]
            .pct_change()
        )

    return df


def encode_machine_model(df):
    """
    One-hot encode machine model.
    """

    df = pd.get_dummies(
        df,
        columns=["model"],
        drop_first=True
    )

    return df


def clean_feature_data(df):
    """
    Handle NaN and infinite values.
    """

    # Replace inf values
    df.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True
    )

    # Fill NaNs
    df.fillna(0, inplace=True)

    return df


def prepare_features(df):
    """
    Master feature engineering pipeline.
    """

    print("Creating rolling features...")
    df = create_rolling_features(df)

    print("Creating lag features...")
    df = create_lag_features(df)

    print("Creating change features...")
    df = create_change_features(df)

    print("Encoding model column...")
    df = encode_machine_model(df)

    print("Cleaning engineered features...")
    df = clean_feature_data(df)

    return df


if __name__ == "__main__":

    from preprocessing import (
        load_data,
        preprocess_data
    )

    telemetry, machines = load_data(
        "../data/PdM_telemetry.csv",
        "../data/PdM_machines.csv"
    )

    master_df = preprocess_data(
        telemetry,
        machines
    )

    feature_df = prepare_features(
        master_df
    )

    print("\nFeature Engineering Complete")
    print(feature_df.shape)

    print("\nColumns:")
    print(feature_df.columns.tolist())

