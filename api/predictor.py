from pathlib import Path
import joblib
import pandas as pd
from api.history import history_manager
from api.services.feature_service import feature_service
PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = PROJECT_ROOT / "models"


class Predictor:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None

    def load(self):

        self.model = joblib.load(
            MODEL_DIR / "isolation_forest.pkl"
        )

        self.scaler = joblib.load(
            MODEL_DIR / "scaler.pkl"
        )

        self.feature_names = joblib.load(
            MODEL_DIR / "features.pkl"
        )

    def predict(self, data: dict):
        history_manager.add_reading(
        data["machineID"],
        data
     )
        history = history_manager.get_history(
         data["machineID"]
     )
        history_df = feature_service.create_history_dataframe(
           history
      )
        rolling_features = feature_service.add_rolling_features(
           history_df
      )
        df = pd.DataFrame([data])
        
        for feature, value in rolling_features.items():

           df[feature] = value

        # One-hot encode model column
        df = pd.get_dummies(
            df,
            columns=["model"]
        )
        

        # Add missing feature columns
        for feature in self.feature_names:

            if feature not in df.columns:
                df[feature] = 0

        # Keep training feature order
        df = df[self.feature_names]
        print("\nRolling Features")

        for key, value in rolling_features.items():

           print(f"{key}: {value:.2f}")
        # Scale
        X_scaled = self.scaler.transform(df)

        # Predict
        anomaly_label = int(
            self.model.predict(X_scaled)[0]
        )

        anomaly_score = float(
            self.model.decision_function(X_scaled)[0]
        )

        risk = (
            "HIGH"
            if anomaly_label == -1
            else "LOW"
        )

        return {
            "anomaly": anomaly_label == -1,
            "anomaly_label": anomaly_label,
            "anomaly_score": anomaly_score,
            "risk_level": risk
        }


predictor = Predictor()