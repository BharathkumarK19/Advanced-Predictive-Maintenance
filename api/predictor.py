from pathlib import Path

import joblib
import pandas as pd
from api.metrics import (
    PREDICTION_COUNT,
    ANOMALY_COUNT
)
from api.history import history_manager
from api.services.feature_service import feature_service
from src.logger import get_logger

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = PROJECT_ROOT / "models"
logger = get_logger()


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

        # --------------------------------------------------
        # Store incoming reading for feature generation
        # --------------------------------------------------

        history_manager.add_reading(
            data["machineID"],
            data
        )
        logger.info(
            "Received reading from Machine %s",
            data["machineID"],
        )

        # --------------------------------------------------
        # Retrieve machine history
        # --------------------------------------------------

        history = history_manager.get_history(
            data["machineID"]
        )

        history_df = (
            feature_service.create_history_dataframe(
                history
            )
        )

        # --------------------------------------------------
        # Generate online engineered features
        # --------------------------------------------------

        online_features = (
            feature_service.create_online_features(
                history_df
            )
        )

        # --------------------------------------------------
        # Build prediction dataframe
        # --------------------------------------------------

        df = pd.DataFrame([data])

        df = pd.concat(
            [
                df,
                pd.DataFrame([online_features])
            ],
            axis=1
        )

        # --------------------------------------------------
        # One-Hot Encode model column
        # --------------------------------------------------

        df = pd.get_dummies(
            df,
            columns=["model"]
        )

        # --------------------------------------------------
        # Add missing training features
        # --------------------------------------------------

        missing = []

        for feature in self.feature_names:

            if feature not in df.columns:

                missing.append(feature)

                df[feature] = 0

        # Ignore expected missing model columns
        critical_missing = [

            feature

            for feature in missing

            if not feature.startswith("model_")

        ]

        if critical_missing:

            logger.warning(
                f"Critical Missing Features: {critical_missing}"
            )

        # --------------------------------------------------
        # Keep exact training feature order
        # --------------------------------------------------

        df = df[self.feature_names]

        # Safety check
        if len(df.columns) != len(self.feature_names):

            raise ValueError(
                "Feature mismatch detected."
            )

        # --------------------------------------------------
        # Debug (Remove after testing)
        # --------------------------------------------------

        logger.debug("Online Feature Vector")

        for key in sorted(online_features):

            if (
                "change" in key
                or "pct_change" in key
                or "zscore" in key
            ):

                logger.debug(
                    f"{key}: {online_features[key]}"
                )

        # --------------------------------------------------
        # Scale
        # --------------------------------------------------

        X_scaled = self.scaler.transform(df)

        # --------------------------------------------------
        # Predict
        # --------------------------------------------------

        anomaly_label = int(
            self.model.predict(X_scaled)[0]
        )
        PREDICTION_COUNT.inc()
        if anomaly_label == -1:
           ANOMALY_COUNT.inc()

        anomaly_score = float(
            self.model.decision_function(X_scaled)[0]
        )
        logger.info(
            f"Machine {data['machineID']} | "
            f"Label={anomaly_label} | "
            f"Score={anomaly_score:.4f}"
        )

        # --------------------------------------------------
        # Risk Level
        # --------------------------------------------------

        if anomaly_score < -0.15:

            risk = "CRITICAL"

        elif anomaly_score < -0.05:

            risk = "HIGH"

        elif anomaly_score < 0:

            risk = "MEDIUM"

        else:

            risk = "LOW"
        logger.info(
            f"Risk Level: {risk}"
        )

        return {

            "anomaly": anomaly_label == -1,

            "anomaly_label": anomaly_label,

            "anomaly_score": anomaly_score,

            "risk_level": risk

        }


predictor = Predictor()
