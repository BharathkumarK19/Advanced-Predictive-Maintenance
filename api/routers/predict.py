from fastapi import APIRouter
from api.predictor import predictor
from api.schemas import (
    PredictionRequest,
    PredictionResponse
)
from src.logger import get_logger

logger = get_logger()
router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(request: PredictionRequest):

    try:

        logger.info(
            f"Prediction Request | "
            f"Machine={request.machineID}"
        )

        result = predictor.predict(
            request.model_dump()
        )

        logger.info(
            f"Prediction Completed | "
            f"Risk={result['risk_level']}"
        )

        return result

    except Exception:

        logger.exception(
            f"Prediction failed | Machine={request.machineID}"
        )

        raise
