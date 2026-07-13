"""
telemetry_handler.py

Handles incoming MQTT telemetry and triggers prediction.

Responsibilities
----------------
1. Receive telemetry payload
2. Run prediction
3. Log prediction result
4. Update Prometheus metrics
"""

from api.history import history_manager
from api.predictor import predictor
from api.metrics import (
    PREDICTION_COUNT,
    ANOMALY_COUNT
)
from api.websocket import manager
from src.logger import get_logger

logger = get_logger()


def handle_telemetry(payload: dict):
    """
    Process incoming telemetry received from MQTT.
    """

    try:

        machine_id = payload.get("machineID")

        logger.info("=" * 60)
        logger.info("Telemetry received | Machine=%s", machine_id)

        PREDICTION_COUNT.inc()

        result = predictor.predict(payload)

        history_entry = history_manager.update_last_reading(
            payload["machineID"],
            result,
        )

        logger.info(
            "Prediction completed | Machine=%s | Risk=%s | Score=%.4f",
            machine_id,
            result["risk_level"],
            result["anomaly_score"],
        )

        logger.info(
            "History updated | Machine=%s | History size=%s",
            machine_id,
            history_manager.history_length(payload["machineID"]),
        )

        if result["anomaly"]:
            ANOMALY_COUNT.inc()

        if history_entry is None:
            logger.warning(
                "History update skipped because no reading exists yet | Machine=%s",
                machine_id,
            )
            return result

        logger.info(
            "Broadcasting telemetry | Machine=%s",
            machine_id,
        )
        manager.broadcast_from_thread(history_entry)

        logger.info("=" * 60)

        return result

    except Exception as ex:

        logger.exception(
            f"Telemetry Processing Failed: {ex}"
        )

        return None
