import pandas as pd


class FeatureService:

    SENSOR_COLUMNS = [
        "volt",
        "rotate",
        "pressure",
        "vibration"
    ]

    @staticmethod
    def create_history_dataframe(history):

        if len(history) == 0:
            return pd.DataFrame()

        return pd.DataFrame(history)

    @staticmethod
    def add_rolling_features(df):

        if df.empty:
            return {}

        features = {}

        for col in FeatureService.SENSOR_COLUMNS:

            features[f"{col}_mean_24h"] = df[col].mean()

            std = df[col].std()

            features[f"{col}_std_24h"] = (
                0 if pd.isna(std) else std
            )

        return features


feature_service = FeatureService()