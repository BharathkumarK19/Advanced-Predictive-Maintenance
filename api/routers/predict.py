from fastapi import APIRouter

from api.predictor import predictor
from api.schemas import (
    PredictionRequest,
    PredictionResponse
)

router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(
    request: PredictionRequest
):

    return predictor.predict(
        request.model_dump()
    )