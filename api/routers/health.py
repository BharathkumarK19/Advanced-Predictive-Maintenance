from fastapi import APIRouter

from api.predictor import predictor

router = APIRouter()


@router.get("/health")
def health():

    return {

        "status": "healthy",

        "model_loaded": predictor.model is not None,

        "scaler_loaded": predictor.scaler is not None,

        "features_loaded": predictor.feature_names is not None

    }