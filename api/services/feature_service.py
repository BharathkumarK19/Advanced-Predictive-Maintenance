import pandas as pd


class FeatureService:

    SENSOR_COLUMNS = [
        "volt",
        "rotate",
        "pressure",
        "vibration"
    ]

    LAGS = [1, 6, 24]

    @staticmethod
    def create_history_dataframe(history):

        if len(history) == 0:
            return pd.DataFrame()

        return pd.DataFrame(history)

    def create_online_features(self, history_df):

      features = {}

      if history_df.empty:
        return features

    # Rolling
      features.update(
        self._rolling_features(history_df)
    )

    # Lag
      features.update(
        self._lag_features(history_df)
    )

    # Change
      features.update(
        self._change_features(
            history_df,
            features
        )
    )

    # Percentage Change
      features.update(
        self._pct_change_features(
            history_df,
            features
        )
    )

    # Z-Score
      features.update(
        self._zscore_features(
            history_df,
            features
        )
    )
      features.update(

    self._trend_features(
        history_df
    )

)

      features.update(

    self._error_features(
        history_df
    )

)

      return features

    def _error_features(self, history_df):

      features = {}

      if "error_flag" not in history_df.columns:

        features["error_count_24h"] = 0

        return features

      window = history_df["error_flag"].tail(24)

      features["error_count_24h"] = (
          window.sum()
      )

      return features
  
    def _change_features(self, history_df, features):

      output = {}

      for sensor in self.SENSOR_COLUMNS:

        current = history_df.iloc[-1][sensor]

        previous = features[f"{sensor}_lag1"]

        output[f"{sensor}_change"] = (
            current - previous
        )

      return output
  
    def _pct_change_features(self, history_df, features):

      output = {}

      for sensor in self.SENSOR_COLUMNS:

        current = history_df.iloc[-1][sensor]

        previous = features[f"{sensor}_lag1"]

        if previous == 0:

            pct = 0

        else:

            pct = (
                current - previous
            ) / previous

        output[f"{sensor}_pct_change"] = pct

      return output
    def _zscore_features(self, history_df, features):

      output = {}

      for sensor in self.SENSOR_COLUMNS:

        current = history_df.iloc[-1][sensor]

        mean = features[f"{sensor}_mean_24h"]

        std = features[f"{sensor}_std_24h"]

        z = (
            current - mean
        ) / (std + 1e-6)

        output[f"{sensor}_zscore"] = z

      return output
    
    def _rolling_features(self, history_df):

         features = {}

         for sensor in self.SENSOR_COLUMNS:

            features[f"{sensor}_mean_24h"] = (
                history_df[sensor].mean()
            )

            std = history_df[sensor].std()

            if pd.isna(std):

                std = 0

            features[f"{sensor}_std_24h"] = std

         return features
    
    def _lag_features(self, history_df):

        features = {}

        n = len(history_df)

        for sensor in self.SENSOR_COLUMNS:

            for lag in self.LAGS:

                if n > lag:

                    value = history_df.iloc[-(lag + 1)][sensor]

                else:

                    value = 0

                features[
                    f"{sensor}_lag{lag}"
                ] = value

        return features
    
    def _trend_features(self, history_df):

      features = {}

      n = len(history_df)

      for sensor in self.SENSOR_COLUMNS:

        if n < 2:

            features[f"{sensor}_trend"] = 0

            continue

        midpoint = n // 2

        older = history_df.iloc[:midpoint]

        recent = history_df.iloc[midpoint:]

        older_mean = older[sensor].mean()

        recent_mean = recent[sensor].mean()

        features[f"{sensor}_trend"] = (
            recent_mean
            -
            older_mean
        )

      return features
    
feature_service = FeatureService()
